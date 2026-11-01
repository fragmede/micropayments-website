import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import test from "node:test";

const bundle = fileURLToPath(new URL("../server-dist/index.mjs", import.meta.url));
const publicOrigin = "https://micropayments.fyi";
const receiver = "0xA0aA3EdfF38C53765bbe5a6BAc2C31b010099306";
const environmentText = await readFile(new URL("../server-dist/payment.env", import.meta.url), "utf8");
const paymentEnvironment = Object.fromEntries(
  environmentText.trim().split("\n").map((line) => {
    const separator = line.indexOf("=");
    return [line.slice(0, separator), JSON.parse(line.slice(separator + 1))];
  }),
);

async function listen(server) {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  return server.address().port;
}

async function unusedPort() {
  const reservation = createServer();
  const port = await listen(reservation);
  await new Promise((resolve) => reservation.close(resolve));
  return port;
}

function spawnApi(overrides) {
  const environment = Object.fromEntries(
    Object.entries(process.env).filter(([name]) => !name.startsWith("X402_")),
  );
  const child = spawn(process.execPath, [bundle], {
    env: { ...environment, ...paymentEnvironment, PUBLIC_ORIGIN: publicOrigin, ...overrides },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.on("data", (data) => { output += data; });
  child.stderr.on("data", (data) => { output += data; });
  const exited = once(child, "exit");
  return { child, exited, output: () => output };
}

async function startApi(t, overrides = {}) {
  const port = await unusedPort();
  const api = spawnApi({ PORT: String(port), ...overrides });
  t.after(async () => {
    if (api.child.exitCode === null) {
      api.child.kill("SIGTERM");
      const [code, signal] = await api.exited;
      assert.equal(signal, null, api.output());
      assert.equal(code, 0, api.output());
    }
  });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`API did not start: ${api.output()}`)), 5000);
    api.child.stdout.on("data", (data) => {
      if (String(data).includes("Payment API listening")) {
        clearTimeout(timeout);
        resolve();
      }
    });
    api.exited.then(() => {
      clearTimeout(timeout);
      reject(new Error(`API exited before listening: ${api.output()}`));
    });
  });
  return `http://127.0.0.1:${port}`;
}

function decodeTerms(response) {
  const header = response.headers.get("payment-required");
  assert.ok(header, "402 response must include payment terms");
  return JSON.parse(Buffer.from(header, "base64").toString("utf8"));
}

test("production environment artifact contains only payment settings", () => {
  assert.ok(Object.keys(paymentEnvironment).every((key) => /^X402_[A-Z0-9_]+$/.test(key)));
  assert.equal(paymentEnvironment.X402_NETWORK_MODE, "mainnet");
  assert.equal(paymentEnvironment.X402_PRICE, "$0.01");
  assert.equal(paymentEnvironment.X402_EVM_PAY_TO, receiver);
});

test("standalone production API preserves payment checks behind an HTTPS proxy", async (t) => {
  const facilitatorRequests = [];
  const facilitator = createServer((request, response) => {
    facilitatorRequests.push(`${request.method} ${request.url}`);
    if (request.method === "GET" && request.url === "/supported") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({
        kinds: [{ x402Version: 2, scheme: "exact", network: "eip155:8453" }],
        extensions: [],
        signers: {},
      }));
      return;
    }
    response.writeHead(500);
    response.end("No verification or settlement is allowed in this fixture");
  });
  const facilitatorPort = await listen(facilitator);
  t.after(() => new Promise((resolve) => facilitator.close(resolve)));
  const apiUrl = await startApi(t, { X402_FACILITATOR_URL: `http://127.0.0.1:${facilitatorPort}` });

  await t.test("status uses the configured mainnet receiver", async () => {
    const response = await fetch(`${apiUrl}/api/x402/status`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    const status = await response.json();
    assert.equal(status.configured, true);
    assert.equal(status.testnet, false);
    assert.equal(status.price, "$0.01");
    assert.deepEqual(status.accepts, [{ network: "eip155:8453", payTo: "0xA0aA...9306", scheme: "exact" }]);
  });

  await t.test("unpaid JSON request has precise terms and a canonical HTTPS URL", async () => {
    const response = await fetch(`${apiUrl}/api/x402/answer?receipt=a%2Fb&next=%2F`, {
      headers: {
        accept: "application/json",
        host: "attacker.example",
        "x-forwarded-host": "attacker.example",
        "x-forwarded-proto": "http",
        forwarded: "host=attacker.example;proto=http",
      },
    });
    assert.equal(response.status, 402);
    assert.equal(response.headers.get("cache-control"), "no-store");
    const terms = decodeTerms(response);
    assert.equal(terms.x402Version, 2);
    assert.equal(terms.resource.url, `${publicOrigin}/api/x402/answer?receipt=a%2Fb&next=%2F`);
    assert.equal(terms.accepts.length, 1);
    const [accepted] = terms.accepts;
    assert.equal(accepted.network, "eip155:8453");
    assert.equal(accepted.scheme, "exact");
    assert.equal(accepted.amount, "10000");
    assert.equal(accepted.asset.toLowerCase(), "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913");
    assert.equal(accepted.payTo, receiver);
    assert.equal(accepted.extra.name, "USD Coin");
    assert.equal(accepted.extra.version, "2");
    assert.doesNotMatch(await response.text(), /A fucking brick/);
  });

  await t.test("a browser receives the HTML payment screen before the answer", async () => {
    const response = await fetch(`${apiUrl}/api/x402/answer`, {
      headers: { accept: "text/html", "user-agent": "Mozilla/5.0" },
    });
    assert.equal(response.status, 402);
    assert.match(response.headers.get("content-type"), /text\/html/);
    assert.equal(response.headers.get("cache-control"), "no-store");
    const html = await response.text();
    assert.match(html, /<!doctype html>/i);
    assert.match(html, /Micropayments\.fyi/);
    assert.doesNotMatch(html, /A fucking brick/);
  });

  await t.test("malformed payment signatures cannot reveal the paid answer", async () => {
    const response = await fetch(`${apiUrl}/api/x402/answer`, {
      headers: { accept: "application/json", "payment-signature": "definitely-not-a-valid-payment" },
    });
    assert.equal(response.status, 402);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(decodeTerms(response).accepts[0].payTo, receiver);
    assert.doesNotMatch(await response.text(), /A fucking brick/);
  });

  assert.deepEqual(facilitatorRequests, ["GET /supported"]);
});

test("mainnet fails closed when no receiving address is configured", async (t) => {
  const apiUrl = await startApi(t, { X402_EVM_PAY_TO: "", X402_FACILITATOR_URL: "http://127.0.0.1:1" });
  const statusResponse = await fetch(`${apiUrl}/api/x402/status`);
  assert.equal((await statusResponse.json()).configured, false);
  const response = await fetch(`${apiUrl}/api/x402/answer`);
  assert.equal(response.status, 503);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("payment-required"), null);
  assert.match((await response.json()).error, /X402_EVM_PAY_TO is required/);
});

test("invalid public origins and ports prevent startup", async (t) => {
  for (const overrides of [
    { PUBLIC_ORIGIN: "" },
    { PUBLIC_ORIGIN: "https://micropayments.fyi/api" },
    { PUBLIC_ORIGIN: "https://user:password@micropayments.fyi" },
    { PUBLIC_ORIGIN: "file:///" },
    { PORT: "0" },
    { PORT: "65536" },
    { PORT: "8789junk" },
  ]) {
    await t.test(JSON.stringify(overrides), async () => {
      const api = spawnApi(overrides);
      const [code, signal] = await api.exited;
      assert.equal(signal, null);
      assert.notEqual(code, 0);
      assert.doesNotMatch(api.output(), /Payment API listening/);
    });
  }
});

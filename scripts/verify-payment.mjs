import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const [origin, publicOrigin = origin, mode] = process.argv.slice(2);
assert(origin && publicOrigin, "Usage: node scripts/verify-payment.mjs URL [PUBLIC_ORIGIN] [--api-only]");
const envFile = await readFile(new URL("../server-dist/payment.env", import.meta.url), "utf8");
const env = Object.fromEntries(envFile.trim().split("\n").map((line) => {
  const separator = line.indexOf("=");
  return [line.slice(0, separator), JSON.parse(line.slice(separator + 1))];
}));
const testnet = env.X402_NETWORK_MODE === "testnet";
const price = /^\$(\d+)(?:\.(\d{1,6}))?$/.exec(env.X402_PRICE);
assert(price, "Expected a USD price with at most six decimal places");
const amount = (BigInt(price[1]) * 1000000n + BigInt((price[2] || "").padEnd(6, "0"))).toString();
const network = testnet ? "eip155:84532" : "eip155:8453";
const asset = testnet ? "0x036cbd53842c5426634e7929541ec2318f3dcf7e" : "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";
const request = (path, headers = {}) => fetch(new URL(path, origin), {
  headers, signal: AbortSignal.timeout(20000), cache: "no-store",
});

const statusResponse = await request("/api/x402/status");
assert.equal(statusResponse.status, 200);
const status = await statusResponse.json();
assert.equal(status.configured, true);
assert.equal(status.testnet, testnet);
assert.equal(status.price, env.X402_PRICE);

for (const accept of ["application/json", "text/html"]) {
  const response = await request("/api/x402/answer", { accept, "user-agent": "Mozilla/5.0" });
  assert.equal(response.status, 402);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const terms = JSON.parse(Buffer.from(response.headers.get("payment-required"), "base64").toString());
  assert.equal(terms.x402Version, 2);
  assert.equal(terms.resource.url, new URL("/api/x402/answer", publicOrigin).href);
  assert.equal(terms.accepts.length, 1);
  const payment = terms.accepts[0];
  assert.equal(payment.network, network);
  assert.equal(payment.payTo.toLowerCase(), env.X402_EVM_PAY_TO.toLowerCase());
  assert.equal(payment.amount, amount);
  assert.equal(payment.asset.toLowerCase(), asset);
  assert.equal(payment.extra.name, testnet ? "USDC" : "USD Coin");
  assert.equal(payment.extra.version, "2");
  const body = await response.text();
  assert(!body.includes("Socialized healthcare"), "Unpaid response exposed the punchline");
  if (accept === "text/html") {
    assert(response.headers.get("content-type").includes("text/html"));
    assert(new RegExp(`testnet:\\s*${testnet}`).test(body));
  }
}

const invalid = await request("/api/x402/answer", { accept: "application/json", "payment-signature": "invalid" });
assert.equal(invalid.status, 402);
assert(!(await invalid.text()).includes("Socialized healthcare"));

if (mode !== "--api-only") {
  const expectedHtml = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
  const scripts = [...expectedHtml.matchAll(/<script\b[^>]*\bsrc=(['"])([^'"]+)\1/gi)];
  assert.equal(scripts.length, 1, "Expected one frontend entry script in the built page");
  const bundleUrl = new URL(scripts[0][2], new URL("/", origin));
  assert.equal(bundleUrl.origin, new URL(origin).origin, "Frontend entry script must be served by this site");

  const page = await request("/");
  assert.equal(page.status, 200);
  assert(
    (page.headers.get("cache-control") || "").split(",").some((directive) => directive.trim().toLowerCase() === "no-cache"),
    "Homepage must require cache revalidation with Cache-Control: no-cache",
  );
  assert.equal(await page.text(), expectedHtml, "Public index HTML does not match this release");
  const bundle = await request(bundleUrl.href);
  assert.equal(bundle.status, 200);
  const digest = (data) => createHash("sha256").update(data).digest("hex");
  const expected = await readFile(new URL(`../dist${bundleUrl.pathname}`, import.meta.url));
  assert.equal(digest(Buffer.from(await bundle.arrayBuffer())), digest(expected), "Public frontend does not match this release");
}
console.log(`Verified ${origin}: current payment terms, receiver, canonical URL, unpaid access control${mode === "--api-only" ? "" : ", and exact frontend build"}. No payment sent.`);

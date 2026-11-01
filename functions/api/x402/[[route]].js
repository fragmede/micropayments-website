import { Hono } from "hono";
import { handle } from "hono/cloudflare-pages";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { paymentMiddleware, x402ResourceServer } from "@x402/hono";
import { createPaywall } from "@x402/paywall";
import { evmPaywall } from "@x402/paywall/evm";

const APP_NAME = "Micropayments.fyi";
const ANSWER_PATH = "/api/x402/answer";
const DEFAULT_PRICE = "$0.01";
const TESTNET_DEMO_PAY_TO = "0x000000000000000000000000000000000000dEaD";

const NETWORK_MODES = {
  testnet: {
    baseNetwork: "Base Sepolia",
    facilitatorUrl: "https://x402.org/facilitator",
    network: "eip155:84532",
    testnet: true,
  },
  mainnet: {
    baseNetwork: "Base",
    facilitatorUrl: "https://facilitator.payai.network",
    network: "eip155:8453",
    testnet: false,
  },
};

const app = new Hono();
let cachedKey;
let cachedPaymentMiddleware;

// Payment terms and paid responses must not be reused by a shared cache.
app.use("*", async (c, next) => {
  await next();
  c.header("Cache-Control", "no-store");
});

const normalizeMode = (mode) => (mode === "testnet" ? "testnet" : "mainnet");

const compactAddress = (address) => {
  if (!address) {
    return null;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });

const resolvePayTo = (env, mode) => {
  if (env.X402_EVM_PAY_TO) {
    return env.X402_EVM_PAY_TO;
  }

  return mode === "testnet" ? TESTNET_DEMO_PAY_TO : "";
};

const buildX402Config = (env = {}) => {
  const mode = normalizeMode(env.X402_NETWORK_MODE);
  const modeConfig = NETWORK_MODES[mode];
  const payTo = resolvePayTo(env, mode);

  return {
    ...modeConfig,
    accepts: payTo
      ? [
          {
            scheme: "exact",
            price: env.X402_PRICE || DEFAULT_PRICE,
            network: modeConfig.network,
            payTo,
          },
        ]
      : [],
    answerPath: ANSWER_PATH,
    configured: Boolean(payTo),
    facilitatorUrl: env.X402_FACILITATOR_URL || modeConfig.facilitatorUrl,
    mode,
    price: env.X402_PRICE || DEFAULT_PRICE,
  };
};

const getPaymentMiddleware = (env) => {
  const config = buildX402Config(env);

  if (!config.configured) {
    return null;
  }

  const key = JSON.stringify({
    mode: config.mode,
    price: config.price,
    facilitatorUrl: config.facilitatorUrl,
    accepts: config.accepts,
  });

  if (cachedPaymentMiddleware && cachedKey === key) {
    return cachedPaymentMiddleware;
  }

  const facilitatorClient = new HTTPFacilitatorClient({
    url: config.facilitatorUrl,
  });

  const resourceServer = new x402ResourceServer(facilitatorClient).register(
    config.network,
    new ExactEvmScheme(),
  );

  const paywallConfig = {
    appName: APP_NAME,
    testnet: config.testnet,
  };

  const paywall = createPaywall()
    .withNetwork(evmPaywall)
    .withConfig(paywallConfig)
    .build();

  cachedKey = key;
  cachedPaymentMiddleware = paymentMiddleware(
    {
      [`GET ${ANSWER_PATH}`]: {
        accepts: config.accepts,
        description: config.testnet
          ? "Reveal the punchline with test USDC (no real money)"
          : "Reveal the punchline and a bonus joke",
        mimeType: "text/html",
      },
    },
    resourceServer,
    paywallConfig,
    paywall,
  );

  return cachedPaymentMiddleware;
};

const renderPaidAnswer = (config) => {
  const safeNetwork = escapeHtml(config.baseNetwork);
  const safePrice = escapeHtml(config.price);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Your punchline · Micropayments.fyi</title>
    <style>
      :root {
        color: #17201c;
        background: #eef2f0;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      body {
        box-sizing: border-box;
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
      }

      main {
        box-sizing: border-box;
        width: min(780px, 100%);
        background: #ffffff;
        border: 1px solid #ccd5d1;
        border-radius: 8px;
        box-shadow: 0 24px 80px rgba(23, 32, 28, 0.14);
        padding: clamp(24px, 5vw, 52px);
      }

      h1 {
        margin: 0 0 22px;
        font-size: clamp(2rem, 6vw, 4.5rem);
        line-height: 0.95;
      }

      p {
        color: #4b5b54;
        font-size: 1.05rem;
        line-height: 1.7;
      }

      .answer {
        display: grid;
        gap: 14px;
        margin: 28px 0;
      }

      .line {
        border: 1px solid #ccd5d1;
        border-radius: 8px;
        padding: 18px;
        background: #f7faf8;
      }

      .line span {
        display: block;
        color: #5a6961;
        font-size: 0.76rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .line strong {
        display: block;
        margin-top: 10px;
        font-size: clamp(1.4rem, 4vw, 2.4rem);
        line-height: 1.05;
      }

      a {
        color: #126c5a;
        font-weight: 800;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Here&apos;s your punchline.</h1>
      <p>
        ${config.testnet ? "Test payment complete. No real money was spent." : "Payment complete."}
        ${safePrice} ${config.testnet ? "in test USDC" : "in USDC"} on ${safeNetwork}.
      </p>
      <div class="answer">
        <div class="line">
          <span>What&apos;s red and bad for your teeth?</span>
          <strong>A fucking brick.</strong>
        </div>
        <div class="line">
          <span>What&apos;s red and good for your teeth?</span>
          <strong>Socialized healthcare.</strong>
        </div>
      </div>
      <p>Keep this page open to keep the answer. A new request may ask for another payment.</p>
      <p><a href="/">Back to the joke</a></p>
    </main>
  </body>
</html>`;
};

app.get("/api/x402/status", (c) => {
  const config = buildX402Config(c.env);

  return c.json({
    appName: APP_NAME,
    answerEndpoint: ANSWER_PATH,
    baseNetwork: config.baseNetwork,
    configured: config.configured,
    facilitatorHost: new URL(config.facilitatorUrl).host,
    mode: config.mode,
    price: config.price,
    testnet: config.testnet,
    accepts: config.accepts.map((accept) => ({
      network: accept.network,
      payTo: compactAddress(accept.payTo),
      scheme: accept.scheme,
    })),
  });
});

app.use(ANSWER_PATH, async (c, next) => {
  const middleware = getPaymentMiddleware(c.env);

  if (!middleware) {
    return c.json(
      {
        error:
          "X402_EVM_PAY_TO is required before Base mainnet payments can be accepted.",
      },
      503,
    );
  }

  return middleware(c, next);
});

app.get(ANSWER_PATH, (c) => {
  return c.html(renderPaidAnswer(buildX402Config(c.env)));
});

app.notFound((c) => c.json({ error: "Unknown x402 endpoint" }, 404));

export const onRequest = handle(app);

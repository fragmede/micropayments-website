import { Hono } from "hono";
import { handle } from "hono/cloudflare-pages";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { paymentMiddleware, x402ResourceServer } from "@x402/hono";
import { createPaywall } from "@x402/paywall";
import { evmPaywall } from "@x402/paywall/evm";
import { svmPaywall } from "@x402/paywall/svm";
import { ExactSvmScheme } from "@x402/svm/exact/server";

const APP_NAME = "Micropayments.fyi";
const BRIEF_PATH = "/api/x402/brief";
const DEFAULT_PRICE = "$0.01";
const DEFAULT_SVM_PAY_TO = "GXmQ9JRpefccTssu3yhMmRVmXSJ7JEQa78pp9xQnsM78";

const NETWORK_MODES = {
  testnet: {
    facilitatorUrl: "https://x402.org/facilitator",
    evmNetwork: "eip155:84532",
    svmNetwork: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
    testnet: true,
  },
  mainnet: {
    facilitatorUrl: "https://facilitator.payai.network",
    evmNetwork: "eip155:8453",
    svmNetwork: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
    testnet: false,
  },
};

const app = new Hono();
let cachedKey;
let cachedPaymentMiddleware;

const normalizeMode = (mode) => (mode === "mainnet" ? "mainnet" : "testnet");

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

const buildX402Config = (env = {}) => {
  const mode = normalizeMode(env.X402_NETWORK_MODE);
  const modeConfig = NETWORK_MODES[mode];
  const price = env.X402_PRICE || DEFAULT_PRICE;
  const facilitatorUrl = env.X402_FACILITATOR_URL || modeConfig.facilitatorUrl;
  const evmPayTo = env.X402_EVM_PAY_TO || "";
  const svmPayTo = env.X402_SVM_PAY_TO || DEFAULT_SVM_PAY_TO;
  const accepts = [];

  if (evmPayTo) {
    accepts.push({
      scheme: "exact",
      price,
      network: modeConfig.evmNetwork,
      payTo: evmPayTo,
    });
  }

  accepts.push({
    scheme: "exact",
    price,
    network: modeConfig.svmNetwork,
    payTo: svmPayTo,
  });

  return {
    ...modeConfig,
    accepts,
    briefPath: BRIEF_PATH,
    facilitatorUrl,
    mode,
    price,
  };
};

const getPaymentMiddleware = (env) => {
  const config = buildX402Config(env);
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

  const resourceServer = new x402ResourceServer(facilitatorClient)
    .register(config.evmNetwork, new ExactEvmScheme())
    .register(config.svmNetwork, new ExactSvmScheme());

  const paywallConfig = {
    appName: APP_NAME,
    testnet: config.testnet,
  };

  const paywall = createPaywall()
    .withNetwork(evmPaywall)
    .withNetwork(svmPaywall)
    .withConfig(paywallConfig)
    .build();

  cachedKey = key;
  cachedPaymentMiddleware = paymentMiddleware(
    {
      [`GET ${BRIEF_PATH}`]: {
        accepts: config.accepts,
        description: "A short paid brief about x402 micropayments",
        mimeType: "text/html",
      },
    },
    resourceServer,
    paywallConfig,
    paywall,
  );

  return cachedPaymentMiddleware;
};

const renderPaidBrief = (config) => {
  const safePrice = escapeHtml(config.price);
  const safeMode = escapeHtml(config.mode);
  const safeNetworks = config.accepts
    .map((accept) => escapeHtml(accept.network))
    .join("<br>");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>x402 brief unlocked</title>
    <style>
      :root {
        color: #17201c;
        background: #eef2f0;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
      }

      main {
        width: min(760px, 100%);
        background: #ffffff;
        border: 1px solid #ccd5d1;
        border-radius: 8px;
        box-shadow: 0 24px 80px rgba(23, 32, 28, 0.14);
        padding: clamp(24px, 5vw, 52px);
      }

      a {
        color: #126c5a;
        font-weight: 700;
      }

      h1 {
        margin: 0 0 18px;
        font-size: clamp(2rem, 6vw, 4rem);
        line-height: 0.95;
      }

      p {
        color: #4b5b54;
        font-size: 1.05rem;
        line-height: 1.7;
      }

      dl {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 12px;
        margin: 28px 0;
      }

      div {
        border: 1px solid #ccd5d1;
        border-radius: 8px;
        padding: 14px;
        background: #f7faf8;
      }

      dt {
        color: #687a72;
        font-size: 0.76rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      dd {
        margin: 8px 0 0;
        font-weight: 800;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>The paid web page still looks like the web.</h1>
      <p>
        This page was served only after an x402 payment was attached to the HTTP request.
        No account, checkout session, or API key was needed by the resource server.
      </p>
      <p>
        The server advertised a ${safePrice} price in a 402 response, the client selected a supported
        payment requirement, and the retried request carried the signed payment payload.
      </p>
      <dl>
        <div>
          <dt>Route</dt>
          <dd>${BRIEF_PATH}</dd>
        </div>
        <div>
          <dt>Mode</dt>
          <dd>${safeMode}</dd>
        </div>
        <div>
          <dt>Networks</dt>
          <dd>${safeNetworks}</dd>
        </div>
      </dl>
      <p><a href="/">Back to Micropayments.fyi</a></p>
    </main>
  </body>
</html>`;
};

app.get("/api/x402/status", (c) => {
  const config = buildX402Config(c.env);

  return c.json({
    appName: APP_NAME,
    endpoint: BRIEF_PATH,
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

app.use(BRIEF_PATH, async (c, next) => {
  const middleware = getPaymentMiddleware(c.env);
  return middleware(c, next);
});

app.get(BRIEF_PATH, (c) => {
  return c.html(renderPaidBrief(buildX402Config(c.env)));
});

app.notFound((c) => c.json({ error: "Unknown x402 endpoint" }, 404));

export const onRequest = handle(app);

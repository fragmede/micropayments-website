# micropayments.fyi

Micropayments.fyi is a Cloudflare Pages site with a real x402-protected resource.

The static React app explains and probes the flow. The paid resource lives at
`/api/x402/brief` and is protected by a Pages Function using `@x402/hono`.

## Local development

```bash
npm install
npm start
```

`npm start` builds the static bundle and runs `wrangler pages dev dist`, which
serves both the React app and the Pages Function.

Useful checks:

```bash
npm run build
curl -i http://localhost:8788/api/x402/status
curl -i http://localhost:8788/api/x402/brief
```

The unpaid brief request should return HTTP `402` with a `PAYMENT-REQUIRED`
header.

## x402 configuration

Defaults are in `wrangler.toml`:

- `X402_NETWORK_MODE=testnet`
- `X402_PRICE=$0.01`
- `X402_SVM_PAY_TO=GXmQ9JRpefccTssu3yhMmRVmXSJ7JEQa78pp9xQnsM78`

Optional production settings:

- Set `X402_NETWORK_MODE=mainnet` to use Base mainnet and Solana mainnet IDs.
- Set `X402_FACILITATOR_URL` to override the default facilitator.
- Set `X402_EVM_PAY_TO` to add a Base receiver address.
- Set `X402_SVM_PAY_TO` to change the Solana receiver address.

Keep receiver addresses and facilitator URLs in Worker/Pages environment
variables. Do not put private keys or facilitator secrets in `src/`.

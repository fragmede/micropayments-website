# micropayments.fyi

Micropayments.fyi is a Cloudflare Pages site that walks a user through setting
up Base and then asks for a one-cent x402 payment to reveal a deliberately lame
joke answer.

The static React app handles the walkthrough. The paid answer lives at
`/api/x402/answer` and is protected by a Pages Function using `@x402/hono`.

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
curl -i http://localhost:8788/api/x402/answer
```

The unpaid answer request should return HTTP `402` with a `PAYMENT-REQUIRED`
header.

## x402 configuration

Defaults are in `wrangler.toml`:

- `X402_NETWORK_MODE=testnet`
- `X402_PRICE=$0.01`

In testnet mode, the function uses a Base Sepolia demo receiver
(`0x000000000000000000000000000000000000dEaD`) so the local 402 flow works
without taking real funds.

Production settings:

- Set `X402_NETWORK_MODE=mainnet` to use Base mainnet.
- Set `X402_EVM_PAY_TO` to the Base address that should receive USDC.
- Set `X402_FACILITATOR_URL` to override the default facilitator.

Do not deploy mainnet payments until `X402_EVM_PAY_TO` is set in Cloudflare
Pages environment variables.

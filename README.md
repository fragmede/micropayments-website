# micropayments.fyi

Micropayments.fyi is a Cloudflare Pages site where a user can open a wallet
checkout to reveal a deliberately lame joke answer. The default price is one
cent, paid with **real USDC on Base mainnet**. Checkout stays unavailable until a
receiving address is configured. Testnet is an explicit local testing option.

The React app shows the joke and one checkout button. Wallet help and x402
details are optional. Checkout stays disabled until the status endpoint returns
valid payment configuration; failures offer a retry instead of guessed terms.

The paid answer lives at `/api/x402/answer`, protected by a Pages Function using
`@x402/hono`. Its built-in browser paywall handles connecting a wallet, switching
networks, and signing the exact payment. For this USDC EIP-3009 flow the
facilitator pays settlement gas, so the buyer does not need ETH for the payment.
The buyer still needs a compatible wallet and USDC on the requested network.

The punchline is served only after successful settlement and is not bundled in
the public React app. API responses use `Cache-Control: no-store`. Access is per
request: refreshing the answer can require another payment.

## Local development

```bash
npm install
npm start
```

`npm start` builds the static bundle and runs `wrangler pages dev dist`, which
serves both the React app and the Pages Function.

For real payments locally, set `X402_EVM_PAY_TO=0x...` to your public Base
receiving address in an ignored `.dev.vars` file. Never put a private key here.
For a test-funds-only session, override the mode explicitly:

```bash
npm run build
npx wrangler pages dev dist --binding X402_NETWORK_MODE=testnet
```

Useful checks:

```bash
npm run build
curl -i http://localhost:8788/api/x402/status
curl -i http://localhost:8788/api/x402/answer
```

With a configured receiver (or an explicit testnet session), the unpaid answer
request should return HTTP `402` with a `PAYMENT-REQUIRED` header. Mainnet without
a receiver returns `503` and the page disables checkout.

To check the browser paywall without paying:

```bash
curl -i -A 'Mozilla/5.0' -H 'Accept: text/html' http://localhost:8788/api/x402/answer
```

The SDK requires both the browser user agent and HTML Accept header. This
checks checkout delivery, not settlement; settlement needs a funded wallet.

## x402 configuration

Defaults are in `wrangler.toml`:

- `X402_NETWORK_MODE=mainnet`
- `X402_PRICE=$0.01`

In testnet mode, the function uses a Base Sepolia demo receiver
(`0x000000000000000000000000000000000000dEaD`) so the local 402 flow works
without taking real funds.

Production settings:

- Set `X402_EVM_PAY_TO` to the Base address that should receive USDC.
- Leave `X402_NETWORK_MODE=mainnet` for real payments.
- Set `X402_FACILITATOR_URL` to override the default facilitator.

Do not deploy mainnet payments until `X402_EVM_PAY_TO` is set in Cloudflare
Pages environment variables.

## Human payment research

See [the research notes](tasks/payment-flow-research.md) for the comparison with
shtein.me, passkey wallets, Base Pay, and card funding. Base Pay is a possible
separate human checkout, not an x402 drop-in: it needs server-side transaction
verification and a durable, payer-bound fulfillment record before delivering
paid content. This revision preserves the existing x402 settlement boundary.

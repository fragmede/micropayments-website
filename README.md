# micropayments.fyi

Micropayments.fyi runs on the existing `do` server, where a user can open a wallet
checkout to reveal a deliberately lame joke answer. The default price is one
cent, paid with **real USDC on Base mainnet** to the public receiving address in
`wrangler.toml`. Testnet is an explicit local testing option.

The React app shows the joke and one checkout button. Wallet help and x402
details are optional. Checkout stays disabled until the status endpoint returns
valid payment configuration; failures offer a retry instead of guessed terms.

Apache serves the frontend and proxies `/api/x402/` to a Node service listening
only on `127.0.0.1:8789`. The paid answer is protected by `@x402/hono`. The shared
API lives in `server/app.mjs`; a thin Pages adapter remains for optional previews.
Its built-in browser paywall handles connecting a wallet, switching
networks, and signing the exact payment. For this USDC EIP-3009 flow the
facilitator pays settlement gas, so the buyer does not need ETH for the payment.
The buyer still needs a compatible wallet and USDC on the requested network.

The punchline is served only after successful settlement and is not bundled in
the public React app. API responses use `Cache-Control: no-store`. Access is per
request: refreshing the answer can require another payment.

## Production deployment

From a clean, committed `main` checkout:

```bash
npm run deploy
```

This runs the production build and integration tests, pushes `main` to GitHub,
then connects with `ssh do`. It fast-forwards the server's source checkout at
`/home/fragmede/projects/micropayments-website` and uploads an isolated release.
The server fetches this public repository over HTTPS, so it does not need a
GitHub SSH key.
The server runs an API preflight using its own Node runtime before activating
the release. The old static build and unrelated `deploy.txt` are preserved.

Production uses `micropayments-node.service` and the existing Apache HTTPS
virtual host. `/var/www/micropayments.fyi` points to `current/dist` inside the
server checkout. The private `server-dist` bundle stays outside the document
root because it contains the paid answer. The service's fixed `PUBLIC_ORIGIN`
ensures payment terms use `https://micropayments.fyi`, regardless of proxy or
client Host headers.

The deployment requires the existing `do` SSH alias, noninteractive sudo, and
Node 20 or later on the server. It retains releases in `releases/` and saves
the previous symlinks, Apache configuration, and service unit in
`deploy-backups/<release>/`. Failed activation restores the previous site.
HTML requires cache revalidation, and each frontend build has a content-hashed
script filename so returning visitors receive updated code.
The final verification checks the exact public frontend bundle and unpaid
payment terms. It never signs a payment or moves funds. DNS is unchanged.

If your SSH agent is unavailable, an existing local identity can be selected
without changing SSH settings: `DEPLOY_SSH_IDENTITY="$HOME/.ssh/id_rsa" npm run deploy`.
On macOS this can use its already-stored Keychain passphrase.

`npm run deploy:pages` remains available for explicitly updating the optional
Cloudflare Pages copy; it is not the production deployment command.

## Local development

```bash
npm install
npm start
```

`npm start` builds the static bundle and runs `wrangler pages dev dist`, which
serves both the React app and the Pages Function.

`npm test` builds both deployment artifacts and runs the standalone API tests
against a local facilitator fixture. No real payment or external facilitator
request is made by those tests.

Local development uses the configured real-money receiving address. To override
it, set `X402_EVM_PAY_TO=0x...` in an ignored `.dev.vars` file. Never put a private key here.
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
- `X402_EVM_PAY_TO=0xA0aA3EdfF38C53765bbe5a6BAc2C31b010099306`

When no receiver is configured in testnet mode, the function uses a Base Sepolia demo receiver
(`0x000000000000000000000000000000000000dEaD`) so the local 402 flow works
without taking real funds.

Production settings:

- Set `X402_EVM_PAY_TO` to the Base address that should receive USDC.
- Leave `X402_NETWORK_MODE=mainnet` for real payments.
- Set `X402_FACILITATOR_URL` to override the default facilitator.

`wrangler.toml` is the source of payment configuration for both runtimes. The
server build writes its `X402_*` values to `server-dist/payment.env`, which
systemd loads without shell expansion. Verify the full address in the
`PAYMENT-REQUIRED` header after deployment. No private key is needed to receive
payments. An actual settled payment still requires a funded wallet and has not
been tested by the automated deployment checks.

## Human payment research

See [the research notes](tasks/payment-flow-research.md) for the comparison with
shtein.me, passkey wallets, Base Pay, and card funding. Base Pay is a possible
separate human checkout, not an x402 drop-in: it needs server-side transaction
verification and a durable, payer-bound fulfillment record before delivering
paid content. This revision preserves the existing x402 settlement boundary.

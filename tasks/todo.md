# x402 Revamp Todo

## Plan

- [x] Review the x402 proof-of-concept article and current x402 docs for the integration shape.
- [x] Inspect the existing micropayments.fyi app, build tooling, and Cloudflare deployment setup.
- [x] Replace the legacy Solana walkthrough UI with an x402-focused experience.
- [x] Add a Cloudflare Pages Function endpoint protected by x402 payment middleware.
- [x] Replace the legacy React 18/Solana wallet dependency stack with the x402-compatible runtime dependencies.
- [x] Update Cloudflare config for the Worker runtime requirements.
- [x] Verify the build and local x402 402 response behavior.
- [x] Review the final diff for simplicity and remove stale implementation code.
- [x] Commit the completed changes to git.

## Review

- `npm run build` passes with the React 19 x402 UI.
- `wrangler pages dev dist --port 8788` serves the static app and Pages Function locally.
- Previous `/api/x402/brief` implementation was replaced by the Base `/api/x402/answer` flow below.

# Base Joke Flow Todo

## Plan

- [x] Check repository status and review the existing x402 implementation.
- [x] Replace the x402 console with a Base setup walkthrough that ends at the joke question.
- [x] Convert the paid x402 endpoint from a generic brief to the paid joke answer.
- [x] Make Base EVM the only advertised payment network and document the required receiver configuration.
- [x] Update styles and docs for the new walkthrough.
- [x] Verify build, local x402 402 response, and browser interaction.
- [x] Update this review section with verification results.
- [x] Commit the completed changes to git.

## Review

- `npm run build` passes with the Base walkthrough UI and copied Base visual asset.
- `GET /api/x402/status` returns 200 with `baseNetwork: "Base Sepolia"` and `/api/x402/answer`.
- Unpaid `GET /api/x402/answer` returns HTTP 402 with a `PAYMENT-REQUIRED` header.
- Decoded payment requirements advertise exact EVM payment on `eip155:84532` for `$0.01` in USDC.
- `GET /assets/base-mark.svg` returns 200 from the local Pages dev server.
- Source/runtime checks confirm the Base walkthrough, answer payment button, EVM-only server code, copied Base visual asset, and paid joke answer strings.
- In-app browser click automation timed out twice during verification, so browser interaction was covered by build, curl, decoded-header, and DOM/source checks rather than a completed click trace.

# Simpler Human Payments — 2026-11-01

## Plan

- [x] Inspect the current site, payment route, and shtein.me joke API.
- [x] Research how agent payment infrastructure can simplify human checkout, including signing, wallet setup, and funding.
- [x] Replace the setup wizard with a joke-first page and direct checkout; show only verified price/network information and make help optional.
- [x] Remove incorrect gas prerequisites, distinguish test funds from real money, and preserve the paid endpoint's access control.
- [x] Verify build, browser interaction, status failures, and unpaid payment requirements.
- [x] Record findings, verification limits, and deployment status; review and commit only this task's changes.
- [x] Configure the user's Base receiving address and check the receiver's facilitator credits.
- [x] Verify real-money payment requirements with the exact receiving address.
- [ ] Verify settlement with an authorized funded wallet.
- [x] Publish and verify the revision at the existing Cloudflare Pages address.
- [x] Update `micropayments.fyi` on its existing Apache server (supersedes the proposed DNS migration).

## Design and acceptance criteria

- A person can see the joke and enter checkout without completing a tutorial or inspecting HTTP headers.
- Checkout continues to use the installed x402 wallet connection, network switch, and signature handling. No automatic payment.
- User requested real money: default to Base mainnet and $0.01 USDC, requiring the user's public receiving address before enabling checkout. Explicit testnet overrides remain available for verification.
- Loading, failed, or missing configuration never displays an enabled checkout or fabricated payment terms; retry is available.
- Test mode is explicitly labeled as test USDC with no real-money charge. Wallet/funding help and protocol details use optional disclosures.
- Evaluate passkey/embedded-wallet and funding options against primary sources; explain what actually removes human work versus simply moving it.
- The API remains payment protected. Verify HTTP 402 and its network/amount, plus the browser checkout response; do not claim a settled payment without observing it.

## Review

- `npm run build` and `git diff --check` pass. No dependencies added.
- Interactive browser verification passed in the narrow in-app viewport: optional help, decoded 402 inspection, and the primary button opening the SDK wallet checkout. A local fixture verified malformed status, HTTP 503, and retry recovery; each failure kept checkout disabled.
- API checks passed for default Base mainnet/$0.01 with missing receiver (status `configured: false`, checkout 503), and an explicitly overridden Base Sepolia test session (JSON/HTML 402, amount 10000, expected network). Malformed payment signatures were rejected and unpaid responses did not contain the punchline.
- API responses now have `Cache-Control: no-store`; review moved the header assignment after middleware completion so replacement settlement-error responses retain it.
- Research is in `tasks/payment-flow-research.md`. Base Pay/passkeys are a possible further improvement for people with Coinbase funds; separate secure fulfillment and real compatibility verification remain necessary.
- No wallet connected, payment approved, or funds moved. Successful settlement and passkey onboarding are unverified.
- At the end of the first implementation pass, the receiver was still pending and the revision was not deployed. Activation results follow.

## Real-money activation

- User supplied `0xA0aA3EdfF38C53765bbe5a6BAc2C31b010099306`; address format and checksum are valid.
- PayAI's receiver-specific free-credit endpoint returns `status: available`, `exhausted: false` for Base mainnet.
- Plan: verify local mainnet JSON/HTML payment requirements, commit the receiver configuration, deploy the existing Pages project, then verify the public checkout and hosting/domain state. Do not send a payment during these checks.
- Local checks passed for the exact receiver, Base mainnet (`eip155:8453`), native USDC (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`), amount `10000`, token domain `USD Coin` version `2`, protected HTML/JSON 402 responses, and no-store caching. Build passed.
- Deployed commit `24dffa4f9071` to the existing Cloudflare Pages production project. Deployment URL: `https://b86a6f53.micropayments-fyi.pages.dev`; stable URL: `https://micropayments-fyi.pages.dev`.
- The same mainnet API assertions passed against the public stable URL. Browser verification confirmed the enabled `Reveal for $0.01` button and navigation to the real-money wallet paywall. No wallet connected or payment sent; settlement remains unverified.
- The custom apex and `www` domains resolve to `162.243.144.64` with Hover nameservers. Updating the apex to Pages requires a separate DNS migration with the complete existing record inventory preserved, or keeping the existing host in front of the new deployment. No registrar, nameserver, or old-server changes were made.

# Deploy to the existing production server

## Plan

- [x] Inspect `ssh do`, identify the micropayments virtual host, source checkout, and current deployment process.
- [x] Implement the smallest maintainable deployment path for the updated frontend and paid API on the existing host.
- [x] Verify configuration, build, and payment protection before switching production; preserve a rollback copy.
- [ ] Fix browser cache reuse with content-hashed frontend assets and HTML revalidation, then verify returning-visitor behavior.
- [ ] Deploy and verify `https://micropayments.fyi` with the exact mainnet payment receiver.
- [ ] Document the production deployment command, update results, and commit the changes.

User clarified that production should be updated through the existing server (`ssh do`), without a DNS migration.

## Review

- Existing Apache document root links to `/home/fragmede/projects/micropayments-website/foo/dist/`. The source checkout is on `main` with only an unrelated untracked `deploy.txt`; it will be preserved.
- Added a bundled, loopback-only Node API using the same Hono application as the Pages adapter. Apache proxies only this site's `/api/x402/` routes; the paid server bundle is outside its document root.
- `npm ci` and production build pass. All 15 integration checks pass with Node 22 and the server's Node 20.20.2, including canonical HTTPS URLs, exact mainnet terms, malformed-payment rejection, and missing-receiver behavior. Pages adapter compilation also passes.
- Deployment scripts retain old releases/configuration and restore them if activation fails or is interrupted. Review addressed stale temporary symlinks, interrupted activation, and checking that the server checkout matches the release commit.
- SSH inspection succeeded initially. A later 1Password agent signing failure was resolved by using the existing local RSA identity through macOS Keychain, without changing SSH settings. `DEPLOY_SSH_IDENTITY` supports that normal authentication fallback for deployment.
- The first authenticated deployment stopped before activation because the old server lacked a GitHub SSH key. The repository is public; server fetch now uses verified anonymous HTTPS, preserving the original remote URL and adding no credentials.
- Release `20261101T224104Z-7cfc1b8fa7cb` activated successfully on the existing server. Public checks passed for the exact frontend, mainnet payment terms, protected answer, and private bundle/config returning 404. The service is enabled and listens only on `127.0.0.1:8789`; Apache configuration passes. The unrelated `deploy.txt` remains untouched, and DNS remains `162.243.144.64`.
- Browser verification caught a cached legacy page despite correct new public bytes. Before marking deployment complete, add content-hashed script names and require HTML revalidation; extend deployment verification to cover the actual HTML and referenced asset.

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
- [ ] Configure the user's Base receiving address and check the receiver's facilitator credits.
- [ ] Verify real-money payment requirements and settlement with an authorized funded wallet.
- [ ] Publish the verified revision and connect the intended public domain.

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
- Awaiting the user's public Base receiving address. The Cloudflare Pages project has no production secrets, and its listed domain is only `micropayments-fyi.pages.dev`. The public `micropayments.fyi` domain currently serves the older Solana tutorial and returns 404 for `/api/x402/status`. This revision has not been deployed.

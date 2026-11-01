# Easier human micropayments

Research date: November 1, 2026. Read-only HTTP requests and documentation review; no wallet connected, payment signed, or funds moved. Recommendations below are design judgments, not measured conversion results.

## Recommendation

The agent-payment work can make this site easier for people, but payment transport and first-time funding are different problems. Keep x402 for funded wallets and agents. Make the direct checkout the first action, remove the required tutorial, and stop asking the buyer to acquire ETH for this USDC payment. For a meaningful next improvement beyond presentation, prototype **Coinbase Wallet / Base Pay with a passkey** as an optional human checkout. It can avoid installing a wallet, managing a recovery phrase, manually selecting Base, and paying network fees. It still needs USDC or an eligible Coinbase funding source.

Do not present a fresh wallet as an instant one-cent card purchase. Current mainstream card rails retain minimum charges and onboarding. If supporting a person with only a card is essential, a prepaid bundle is a different product decision.

## What shtein.me actually does

On November 1, an unpaid request to [the joke endpoint](https://shtein.me/api/joke) returned HTTP 402. With `Accept: application/json`, the body was `{}` and `PAYMENT-REQUIRED` contained x402 version 2 requirements:

| Field | Observed value |
| --- | --- |
| Price | `10000` atomic USDC units: $0.01 |
| Scheme | `exact` |
| First network | Base mainnet, `eip155:8453` |
| Base asset | Native USDC, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| Second network | Solana mainnet, `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp` |
| Expiry window | 300 seconds |

Sending browser-like headers (`Accept: text/html`, Mozilla user agent) produced an HTML wallet paywall, still HTTP 402, approximately 2.33 MB before compression. It embedded the same requirements and `testnet: false`. Neither response advertised a `WWW-Authenticate` MPP challenge. This proves x402 availability on these requests; it does not prove that no other route or negotiation mode supports MPP.

The [author's implementation article](https://shtein.me/posts/x402-poc/) uses the official Hono middleware and `@x402/paywall`, and instructs visitors to fund a wallet first. That is essentially the site's existing payment architecture. The reference is simpler because it sends the visitor straight to checkout, not because it eliminates wallet funding. Its published test transaction is the author's evidence, not a payment independently reproduced here.

## What is already available in this repository

At research start, `functions/api/x402/[[route]].js` already explicitly supplied `createPaywall().withNetwork(evmPaywall)`. The installed paywall version was 2.17.0. `src/App.js` added a five-section setup walkthrough before its final payment section, including a separate ETH gas requirement and protocol-header inspection.

The official [paywall package](https://github.com/x402-foundation/x402/tree/main/typescript/packages/http/paywall) provides wallet connection, balance checks, and network handling. Its [provider implementation](https://github.com/x402-foundation/x402/blob/main/typescript/packages/http/paywall/src/Providers.tsx) includes injected and Coinbase Wallet connectors. It selects the first supported network requirement; adding Solana does not automatically create a polished user choice between networks. It also does not automatically provide a production fiat funding flow.

The [EVM exact specification](https://github.com/x402-foundation/x402/blob/main/specs/schemes/exact/scheme_exact_evm.md) says the facilitator submits settlement and pays its gas. For native USDC's EIP-3009 path, the buyer signs an authorization and needs USDC, not ETH for that payment. This conclusion is specific to this transfer method: other token approval or funding transactions may differ.

## Human checkout options

| Option | What gets easier | Remaining work or friction | Recommendation |
| --- | --- | --- | --- |
| Existing x402 browser paywall | Connect, inspect the amount, authorize, receive the answer; no separate gas token for this USDC payment | Funded supported wallet still required | Use immediately; move educational material behind optional help |
| Coinbase Wallet / Base Pay | Passkey wallet, automatic gas handling, USDC from Coinbase Wallet or Coinbase account | Funding if no eligible balance; separate fulfillment integration | Best next prototype for human payment itself |
| Embedded user wallet + onramp | Email/social login can create a wallet; funding can stay in the app | Provider project/configuration, authentication, funding verification, region limitations | More infrastructure than a one-joke demo warrants unless new-to-crypto visitors are the central audience |
| MPP Tempo payment link | Hosted browser wallet checkout alongside an agent-friendly endpoint | Tempo wallet and supported stablecoin balance; another payment method to operate | Useful interoperability, not a demonstrated removal of first-time funding |
| MPP Stripe card payment | Familiar card form; no buyer crypto wallet needed | $0.50 minimum card charge, merchant setup | Only if changing to a bundle or higher purchase amount |

### Passkeys and Base Pay

Current [Coinbase Wallet documentation](https://docs.cdp.coinbase.com/coinbase-wallet/overview) recommends `@base-org/account`; the product's documentation moved from Base to Coinbase. It describes cross-app passkey sign-in without extension installation or seed phrases. The [`pay()` reference](https://docs.cdp.coinbase.com/coinbase-wallet/reference/base-pay/pay) explicitly includes `"0.01"` as an accepted amount example and provides a testnet option. These are documented capabilities, not a completed test on this site.

The [payment integration guide](https://docs.cdp.coinbase.com/coinbase-wallet/guides/accept-payments) says gas sponsorship is automatic and users can pay with Coinbase Wallet or Coinbase account USDC. It also requires backend verification of payment completion, amount, recipient, payer binding, and persistent replay protection before fulfillment. A `pay()` transfer receipt is not an x402 `PAYMENT-SIGNATURE`; a secure second checkout cannot be implemented merely by changing the existing button's click handler.

An alternative is using a passkey wallet as the signer for the existing x402 route. However, [official x402 wallet compatibility](https://docs.x402.org/advanced-concepts/wallet-compatibility) is conditional: deployed smart accounts require compatible token signature verification; undeployed ERC-6492 wallets additionally require a facilitator factory allowlist. The [upstream Coinbase smart-wallet issue](https://github.com/x402-foundation/x402/issues/623) was closed after upstream fixes, while explicitly noting hosted facilitators must update and configure this support. PayAI's public supported-networks response did not establish that factory configuration. Do not promise universal first-time passkey support without testing it.

### Embedded wallets and card funding

[CDP user wallets](https://docs.cdp.coinbase.com/wallets/quickstart/user-auth) support email, SMS, and social login without seed phrases, with a CDP project and allowed app domain. Creating a wallet does not fund it.

[Coinbase Onramp](https://docs.cdp.coinbase.com/onramp/onramp-overview) now directs guest Apple Pay/card integrations to its Headless API; its hosted guest flow has a June 30, 2026 deprecation notice. [Headless Onramp](https://docs.cdp.coinbase.com/onramp/headless-onramp/overview) requires app approval for production and currently serves US users with real US mobile numbers. Email/phone verification is required, either app-managed or inside Coinbase's embedded session. Web Apple Pay needs domain registration and verification. Older cached pages advertising simpler guest checkout should not be treated as current integration guidance. A current universal minimum onramp purchase was not established in this review.

### MPP and cards

MPP's [payment-link guide](https://mpp.dev/guides/payment-links) supports a Tempo wallet UI and a Stripe Elements card form. Its [x402 Hono wrapper](https://mpp.dev/sdk/typescript/x402/hono) can preserve existing x402 routes, but requires x402 packages 2.22 or later plus a challenge secret; that is newer than the installed 2.17.0. This is an additive protocol option, not evidence that the user-facing wallet/funding steps disappear.

The official [Stripe MPP guide](https://docs.stripe.com/payments/machine/mpp) is decisive for the one-cent constraint: card Shared Payment Token charges have a $0.50 minimum, while stablecoin charges can start at $0.01. A card-backed prepaid balance could spread a larger charge across one-cent purchases, but introduces balance accounting, purchase state, and different product semantics. It is not a one-cent card checkout.

## Practical implementation sequence

1. Keep the existing x402 route and exact price. Make the joke and payment action primary; provide wallet/funding help only when requested. Clearly label testnet versus real funds and disable checkout when live configuration cannot be confirmed.
2. Correct gas guidance to say no ETH is needed **for this USDC payment**. Let checkout request the correct network rather than making users follow network setup instructions first.
3. Prototype the passkey path on testnet with a fresh wallet, an existing funded wallet, insufficient funds, rejection, and retry. Choose x402 signing only if the selected facilitator demonstrates fresh-wallet compatibility; otherwise use Base Pay with a separate verified fulfillment route.
4. Add embedded card funding or bundles only if enabling people without crypto outweighs the additional setup and purchase amount.

The current [PayAI facilitator](https://facilitator.payai.network/) also differs from the July blog's description: it advertises 1,000 free credits followed by per-network settlement charges. Verify live pricing before describing operating costs as free. It covers settlement gas but explicitly does not provide card checkout or fiat funding.

## Real-money Base deployment check

Following the user's clarification that the site should use real money, read-only checks on November 1 confirmed:

- PayAI's live [`/supported`](https://facilitator.payai.network/supported) response includes x402 v2 `exact` on Base mainnet (`eip155:8453`).
- [Circle lists](https://developers.circle.com/stablecoins/usdc-contract-addresses) the native Base USDC address as `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`. Independent `eth_call` reads through Base's public RPC returned `name = "USD Coin"`, `symbol = "USDC"`, `decimals = 6`, and `version = "2"`. Therefore one cent is `10000` atomic units and the EIP-712 token domain uses `USD Coin`, version `2`.
- The live [OpenAPI definition](https://facilitator.payai.network/openapi.json) allows unauthenticated requests or optional bearer authentication; `POST /settle` inherits that policy. This supports the documented no-key startup path for Base exact. No settlement request was sent.
- The [`/pricing`](https://facilitator.payai.network/pricing) JSON response reported Base `exact` / `eip3009` at **1.97 credits = $0.00197 per settled payment**, effective October 25, 2026, with no upcoming changes listed. That is 0.197 cents, or **19.7% of a one-cent sale** after free credits are exhausted. Rates can change; do not hard-code that estimate into customer pricing copy.
- The [developer reference](https://facilitator.payai.network/developers) assigns 1,000 free credits to the receiving `payTo` address. At the observed rate this covers approximately 507 payments, not 1,000 payments. After exhaustion, settlement returns HTTP 403 with a `free_tier_exhausted` reason and a merchant top-up link. `GET /free-credits?payTo=<recipient>&network=eip155:8453` can check the actual receiver once supplied.

Mainnet is technically supported by the selected default facilitator. Deployment still needs the user's real Base receiving address; the testnet burn address must never become a real-money fallback. Free-credit availability is receiver-specific and was not checked before that address was supplied. The quoted cost is the merchant facilitator charge; the buyer still signs a one-cent USDC authorization without ETH for this settlement.

## Unverified

No end-to-end purchase, wallet onboarding, balance transfer, provider eligibility, facilitator smart-wallet factory configuration, or mobile checkout was exercised. The browser-like shtein request verified HTML negotiation and embedded requirements, not interactive payment success. Actual UX improvement should be measured with a new user who has no wallet as well as an already funded user.

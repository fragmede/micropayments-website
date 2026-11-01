# Lessons

- When evaluating whether agent payments make human payments easier, assess the
  entire purchase: wallet creation, funding, approval, and fulfillment. Reducing
  tutorial screens is useful, but does not establish that paying is easier.
  Compare existing funded-wallet users with people starting from a card or bank
  account, and verify provider limits before recommending a checkout change.
- The user wants this demo to take real one-cent payments. Use Base mainnet by
  default, require their explicit public receiving address, and reserve testnet
  for deliberate verification. Never substitute a demo/burn address for a real
  receiver or imply that a simulated payment proves a live payment succeeded.
- Production is the existing server reached with `ssh do`. Before treating a
  Cloudflare Pages deployment as the completed site update, inspect and update
  the actual domain's server deployment. Keep the current DNS unless the user
  requests a migration, and make the repository's deploy command target the
  established production path.

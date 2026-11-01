import React, { useEffect, useState } from "react";

const STATUS_ENDPOINT = "/api/x402/status";
const ANSWER_ENDPOINT = "/api/x402/answer";

const isRecord = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const isText = (value) => typeof value === "string" && value.trim().length > 0;

const validateStatus = (payload) => {
  if (
    !isRecord(payload) ||
    typeof payload.configured !== "boolean" ||
    typeof payload.testnet !== "boolean" ||
    !isText(payload.price) ||
    !isText(payload.baseNetwork)
  ) {
    throw new Error("The payment service returned incomplete settings.");
  }

  return payload;
};

const decodePaymentHeader = (header) => {
  const bytes = Uint8Array.from(window.atob(header), (character) =>
    character.charCodeAt(0),
  );
  const payload = JSON.parse(new TextDecoder().decode(bytes));
  const validRequirement = (requirement) =>
    isRecord(requirement) &&
    requirement.scheme === "exact" &&
    /^eip155:\d+$/.test(requirement.network) &&
    typeof requirement.amount === "string" &&
    /^\d+$/.test(requirement.amount) &&
    /[1-9]/.test(requirement.amount) &&
    /^0x[\da-fA-F]{40}$/.test(requirement.asset) &&
    /^0x[\da-fA-F]{40}$/.test(requirement.payTo) &&
    Number.isInteger(requirement.maxTimeoutSeconds) &&
    requirement.maxTimeoutSeconds > 0;

  if (
    !isRecord(payload) ||
    payload.x402Version !== 2 ||
    !isRecord(payload.resource) ||
    !isText(payload.resource.url) ||
    !Array.isArray(payload.accepts) ||
    payload.accepts.length === 0 ||
    !payload.accepts.every(validRequirement)
  ) {
    throw new Error("The response did not contain valid x402 payment terms.");
  }

  return payload;
};

const App = () => {
  const [status, setStatus] = useState(null);
  const [statusState, setStatusState] = useState("loading");
  const [statusError, setStatusError] = useState("");
  const [statusAttempt, setStatusAttempt] = useState(0);
  const [probeState, setProbeState] = useState("idle");
  const [paymentRequired, setPaymentRequired] = useState(null);
  const [probeError, setProbeError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setStatus(null);
    setStatusState("loading");
    setStatusError("");

    const loadStatus = async () => {
      try {
        const response = await fetch(STATUS_ENDPOINT, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`The payment service returned HTTP ${response.status}.`);
        }

        const payload = validateStatus(await response.json());
        if (!controller.signal.aborted) {
          setStatus(payload);
          setStatusState(payload.configured ? "ready" : "unconfigured");
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setStatusState("error");
          setStatusError(error.message);
        }
      }
    };

    loadStatus();
    return () => controller.abort();
  }, [statusAttempt]);

  const inspectPaymentRequirement = async () => {
    setProbeState("loading");
    setProbeError("");
    setPaymentRequired(null);

    try {
      const response = await fetch(ANSWER_ENDPOINT, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      const header = response.headers.get("PAYMENT-REQUIRED");
      if (response.status !== 402 || !header) {
        throw new Error(
          `Expected HTTP 402 with payment terms; received HTTP ${response.status}${
            header ? "." : " without a PAYMENT-REQUIRED header."
          }`,
        );
      }

      setPaymentRequired(decodePaymentHeader(header));
      setProbeState("ready");
    } catch (error) {
      setProbeState("error");
      setProbeError(error.message);
    }
  };

  const checkoutReady = statusState === "ready";
  const retryStatus = () => setStatusAttempt((attempt) => attempt + 1);

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/">micropayments.fyi</a>
        <span className="network-brand">
          <img src="/assets/base-mark.svg" alt="" width="20" height="20" />
          Built on Base
        </span>
      </header>

      <main>
        <section className="joke-card" aria-labelledby="joke-question">
          <div className="joke-content">
            <p className="eyebrow">A tiny payment. A terrible joke.</p>
            <h1 id="joke-question">What&apos;s red and bad for your teeth?</h1>
            <p className="lede">
              Unlock the punchline and a follow-up joke with a small USDC payment.
            </p>
          </div>

          <div className="checkout">
            {status && (
              <p className="payment-terms">
                <strong>{status.price}</strong>
                <span>{status.testnet ? "test USDC" : "USDC"} on {status.baseNetwork}</span>
              </p>
            )}
            <button
              className="button primary"
              type="button"
              disabled={!checkoutReady}
              aria-describedby="checkout-status checkout-explanation"
              onClick={() => {
                if (checkoutReady) {
                  window.location.assign(ANSWER_ENDPOINT);
                }
              }}
            >
              {statusState === "loading"
                ? "Checking payment…"
                : checkoutReady
                  ? status.testnet
                    ? "Try with test USDC"
                    : `Reveal for ${status.price}`
                  : "Checkout unavailable"}
              {checkoutReady && <span aria-hidden="true">↗</span>}
            </button>
            <div id="checkout-status" className="checkout-status" role="status" aria-live="polite">
              {statusState === "loading" && <p>Getting the current price and network.</p>}
              {statusState === "ready" && status.testnet && (
                <p className="test-notice">Test mode: test USDC, no real money.</p>
              )}
              {statusState === "ready" && !status.testnet && (
                <p>A real USDC payment on {status.baseNetwork}.</p>
              )}
              {statusState === "error" && (
                <p>We couldn&apos;t load the payment settings. Please try again.</p>
              )}
              {statusState === "unconfigured" && (
                <p>Payments haven&apos;t been set up yet. Please check back soon.</p>
              )}
            </div>
            {(statusState === "error" || statusState === "unconfigured") && (
              <button className="text-button" onClick={retryStatus} type="button">
                Retry payment settings
              </button>
            )}
            <p id="checkout-explanation" className="checkout-explanation">
              Connect your wallet, approve the amount, then see the answer.
              Nothing is paid until you approve in your wallet.
            </p>
          </div>
        </section>

        <div className="disclosures">
          <details className="help-details">
            <summary>New to paying with a wallet?</summary>
            <div className="details-content">
              <p>
                You&apos;ll need an EVM wallet and enough {status?.testnet ? "test USDC" : "USDC"}
                {status ? ` on ${status.baseNetwork}` : " on the network shown at checkout"}.
                Checkout helps you connect your wallet and switch networks.
              </p>
              <p>No ETH is needed for this USDC payment.</p>
              <p>
                No extension? Choose Coinbase Wallet in checkout to see its browser wallet options.
              </p>
              {status?.testnet ? (
                <p>
                  Need test funds? Open the <a href="https://faucet.circle.com/" target="_blank" rel="noreferrer">Circle faucet</a>,
                  select <strong>Base Sepolia</strong>, and request test USDC for your wallet address.
                  These are practice tokens with no real-money value.
                </p>
              ) : status ? (
                <p>
                  If you need to fund your wallet, make sure your USDC is on {status.baseNetwork}.
                  Your exchange or funding service may charge its own fees.
                </p>
              ) : (
                <p>Wait for the payment settings to load before adding funds.</p>
              )}
            </div>
          </details>

          <details className="developer-details">
            <summary>For developers: the payment underneath</summary>
            <div className="details-content">
              <p>
                This page uses x402: the server returns payment terms with HTTP 402,
                and checkout handles the wallet approval. Inspecting the terms sends no payment.
              </p>
              <dl className="contract-list">
                <div><dt>Endpoint</dt><dd><code>{ANSWER_ENDPOINT}</code></dd></div>
                <div><dt>Settings</dt><dd>{statusState}</dd></div>
              </dl>
              {statusError && <p className="error-message">{statusError}</p>}
              {status && <pre aria-label="Payment settings">{JSON.stringify(status, null, 2)}</pre>}
              <button
                className="button secondary"
                disabled={probeState === "loading" || !checkoutReady}
                onClick={inspectPaymentRequirement}
                type="button"
              >
                {probeState === "loading" ? "Inspecting…" : probeState === "error" ? "Retry inspection" : "Inspect 402"}
              </button>
              <div className="probe-status" role="status" aria-live="polite">
                {probeState === "loading" && <p>Requesting the unpaid response…</p>}
                {probeState === "error" && <p className="error-message">{probeError}</p>}
                {probeState === "ready" && <p>HTTP 402 received. Decoded PAYMENT-REQUIRED header:</p>}
              </div>
              {paymentRequired && (
                <pre aria-label="Decoded payment requirements">{JSON.stringify(paymentRequired, null, 2)}</pre>
              )}
            </div>
          </details>
        </div>
      </main>

      <footer className="site-footer">
        <span>Small payments, one bad joke at a time.</span>
        <a href="https://www.x402.org/" target="_blank" rel="noreferrer">Powered by x402 <span aria-hidden="true">↗</span></a>
      </footer>
    </div>
  );
};

export default App;

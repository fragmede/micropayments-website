import React, { useEffect, useState } from "react";

const STATUS_ENDPOINT = "/api/x402/status";
const ANSWER_ENDPOINT = "/api/x402/answer";

const fallbackStatus = {
  accepts: [
    {
      network: "eip155:84532",
      payTo: "0x0000...dEaD",
      scheme: "exact",
    },
  ],
  answerEndpoint: ANSWER_ENDPOINT,
  baseNetwork: "Base Sepolia",
  configured: true,
  facilitatorHost: "x402.org",
  mode: "testnet",
  price: "$0.01",
  testnet: true,
};

const steps = [
  {
    title: "Pick a Base-capable wallet",
    kicker: "Wallet",
    body:
      "Use Coinbase Wallet, MetaMask, Rabby, or another EVM wallet that can switch to Base. Unlock it before you start the payment step.",
    checks: [
      "You can see the wallet extension or mobile app.",
      "You control the wallet and recovery phrase.",
      "The wallet can connect to websites.",
    ],
  },
  {
    title: "Switch the wallet to Base",
    kicker: "Network",
    body:
      "Select the Base network shown in the payment panel below. Testnet mode uses Base Sepolia; production mode uses Base mainnet.",
    checks: [
      "Base mainnet chain id is 8453.",
      "Base Sepolia chain id is 84532.",
      "The active network matches the payment panel below.",
    ],
  },
  {
    title: "Keep a little ETH for gas",
    kicker: "Gas",
    body:
      "Base payments settle in USDC, but the wallet still needs a small ETH balance on the same Base network to submit transactions.",
    checks: [
      "ETH is on Base, not Ethereum mainnet.",
      "A few cents of ETH is enough for this kind of test.",
      "The wallet balance view shows the selected Base network.",
    ],
  },
  {
    title: "Add USDC on Base",
    kicker: "Funds",
    body:
      "The x402 exact scheme prices this answer at one cent in USDC. Bridge, receive, or faucet the right USDC for the active Base network.",
    checks: [
      "The USDC asset is on the same network as the payment request.",
      "You have at least $0.01 available.",
      "The payment request is for an exact amount.",
    ],
  },
  {
    title: "Read the HTTP 402 terms",
    kicker: "x402",
    body:
      "Before paying, inspect the protected route. The server should answer with HTTP 402 and a machine-readable PAYMENT-REQUIRED header.",
    checks: [
      "The route is /api/x402/answer.",
      "The scheme is exact.",
      "The advertised network starts with eip155 for Base.",
    ],
  },
];

const decodePaymentHeader = (header) => {
  const decoded = window.atob(header);
  return JSON.parse(decoded);
};

const formatNetworks = (accepts = []) => {
  if (!accepts.length) {
    return "Not configured";
  }

  return accepts.map((accept) => accept.network).join(", ");
};

const App = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [status, setStatus] = useState(fallbackStatus);
  const [statusState, setStatusState] = useState("loading");
  const [probeState, setProbeState] = useState("idle");
  const [paymentRequired, setPaymentRequired] = useState(null);
  const [probeError, setProbeError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    fetch(STATUS_ENDPOINT)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Status endpoint returned ${response.status}`);
        }

        return response.json();
      })
      .then((payload) => {
        if (isCurrent) {
          setStatus(payload);
          setStatusState(payload.configured ? "ready" : "needs receiver");
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setStatusState("fallback");
          setProbeError(error.message);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const inspectPaymentRequirement = async () => {
    setProbeState("loading");
    setProbeError("");
    setPaymentRequired(null);

    try {
      const response = await fetch(ANSWER_ENDPOINT, {
        headers: {
          Accept: "application/json",
        },
      });
      const header = response.headers.get("PAYMENT-REQUIRED");

      if (response.status !== 402 || !header) {
        throw new Error(`Expected HTTP 402, received ${response.status}`);
      }

      setPaymentRequired(decodePaymentHeader(header));
      setProbeState("ready");
      setActiveStep(steps.length);
    } catch (error) {
      setProbeState("error");
      setProbeError(error.message);
    }
  };

  const goToNextStep = () => {
    setActiveStep((currentStep) => Math.min(currentStep + 1, steps.length));
  };

  const goToPreviousStep = () => {
    setActiveStep((currentStep) => Math.max(currentStep - 1, 0));
  };

  const currentStep = steps[activeStep];
  const progress = Math.round(((activeStep + 1) / (steps.length + 1)) * 100);

  return (
    <main className="app-shell">
      <section className="intro-grid" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="brand">Micropayments.fyi</p>
          <p className="eyebrow">Base setup walkthrough</p>
          <h1 id="page-title">Pay one cent for a bad joke.</h1>
          <p className="lede">
            Set up a Base wallet, check the x402 payment terms, then pay{" "}
            {status.price} to reveal the answer to a deliberately lame
            two-part joke.
          </p>
        </div>

        <aside className="joke-card" aria-label="Joke prompt">
          <img className="base-mark" src="/assets/base-mark.svg" alt="Base" />
          <p className="eyebrow">Question</p>
          <h2>What&apos;s red and bad for your teeth?</h2>
          <p>
            The answer is behind an x402 payment on Base. The follow-up answer
            is included after the payment clears.
          </p>
          <a
            className={`button primary ${status.configured ? "" : "disabled"}`}
            href={status.configured ? ANSWER_ENDPOINT : undefined}
            aria-disabled={!status.configured}
          >
            Pay {status.price} for answer
          </a>
        </aside>
      </section>

      <section className="status-grid" aria-label="x402 endpoint status">
        <article>
          <span>Network</span>
          <strong>{status.baseNetwork}</strong>
        </article>
        <article>
          <span>Price</span>
          <strong>{status.price}</strong>
        </article>
        <article>
          <span>Endpoint</span>
          <strong>{status.answerEndpoint}</strong>
        </article>
        <article>
          <span>Status</span>
          <strong>{statusState}</strong>
        </article>
      </section>

      <section className="walkthrough" aria-label="Base setup steps">
        <nav className="step-list" aria-label="Setup progress">
          {[...steps, { kicker: "Pay", title: "Reveal the answer" }].map(
            (step, index) => (
              <button
                className={index === activeStep ? "active" : ""}
                key={step.title}
                onClick={() => setActiveStep(index)}
                type="button"
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                {step.kicker}
              </button>
            ),
          )}
        </nav>

        <div className="step-panel">
          <div className="progress-track" aria-label={`${progress}% complete`}>
            <span style={{ width: `${progress}%` }} />
          </div>

          {currentStep ? (
            <article className="setup-step">
              <p className="eyebrow">{currentStep.kicker}</p>
              <h2>{currentStep.title}</h2>
              <p>{currentStep.body}</p>
              <ul>
                {currentStep.checks.map((check) => (
                  <li key={check}>{check}</li>
                ))}
              </ul>
            </article>
          ) : (
            <article className="setup-step answer-step">
              <p className="eyebrow">Final step</p>
              <h2>Ask x402 for the punchline.</h2>
              <p>
                The browser paywall opens when you request the answer. The
                inspect button shows the same HTTP 402 terms without sending a
                payment.
              </p>
              <div className="action-row" aria-label="Answer actions">
                <a
                  className={`button primary ${
                    status.configured ? "" : "disabled"
                  }`}
                  href={status.configured ? ANSWER_ENDPOINT : undefined}
                  aria-disabled={!status.configured}
                >
                  Pay {status.price} for answer
                </a>
                <button
                  className="button secondary"
                  disabled={probeState === "loading" || !status.configured}
                  onClick={inspectPaymentRequirement}
                  type="button"
                >
                  {probeState === "loading" ? "Inspecting" : "Inspect 402"}
                </button>
              </div>
            </article>
          )}

          <div className="step-controls">
            <button
              className="button secondary"
              disabled={activeStep === 0}
              onClick={goToPreviousStep}
              type="button"
            >
              Previous
            </button>
            <button
              className="button secondary"
              disabled={activeStep === steps.length}
              onClick={goToNextStep}
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      <section className="workbench">
        <div className="panel">
          <div className="section-heading">
            <p className="eyebrow">Payment route</p>
            <h2>{status.answerEndpoint}</h2>
          </div>
          <div className="contract-list">
            <div>
              <span>Scheme</span>
              <strong>exact</strong>
            </div>
            <div>
              <span>Network</span>
              <strong>{formatNetworks(status.accepts)}</strong>
            </div>
            <div>
              <span>Receiver</span>
              <strong>
                {status.accepts?.[0]?.payTo || "Set X402_EVM_PAY_TO"}
              </strong>
            </div>
            <div>
              <span>Facilitator</span>
              <strong>{status.facilitatorHost}</strong>
            </div>
          </div>
        </div>

        <div className="panel response-panel">
          <div className="section-heading">
            <p className="eyebrow">Unpaid response</p>
            <h2>PAYMENT-REQUIRED header</h2>
          </div>

          {paymentRequired ? (
            <pre>
              {JSON.stringify(
                {
                  resource: paymentRequired.resource,
                  accepts: paymentRequired.accepts,
                },
                null,
                2,
              )}
            </pre>
          ) : (
            <div className="empty-state">
              <strong>{probeError || "No probe has run yet."}</strong>
              <span>
                Inspect the final step to decode the x402 terms before paying.
              </span>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default App;

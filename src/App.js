import React, { useEffect, useState } from "react";

const STATUS_ENDPOINT = "/api/x402/status";
const PAID_ENDPOINT = "/api/x402/brief";

const fallbackStatus = {
  accepts: [
    {
      network: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      payTo: "GXmQ9J...sM78",
      scheme: "exact",
    },
  ],
  endpoint: PAID_ENDPOINT,
  facilitatorHost: "x402.org",
  mode: "testnet",
  price: "$0.01",
  testnet: true,
};

const decodePaymentHeader = (header) => {
  const decoded = window.atob(header);
  return JSON.parse(decoded);
};

const formatNetworks = (accepts = []) => {
  if (!accepts.length) {
    return "Waiting for endpoint";
  }

  return accepts.map((accept) => accept.network).join(", ");
};

const App = () => {
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
          setStatusState("ready");
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
      const response = await fetch(PAID_ENDPOINT, {
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
    } catch (error) {
      setProbeState("error");
      setProbeError(error.message);
    }
  };

  return (
    <main className="app-shell">
      <section className="hero-panel" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="brand">Micropayments.fyi</p>
          <p className="eyebrow">HTTP-native payments</p>
          <h1 id="page-title">x402 payments over HTTP.</h1>
          <p className="lede">
            This site exposes a real paid resource over HTTP 402. Agents see
            machine-readable payment requirements. People get the x402 wallet
            paywall before the content is served.
          </p>
          <div className="action-row" aria-label="x402 actions">
            <a className="button primary" href={PAID_ENDPOINT}>
              Open paid brief
            </a>
            <button
              className="button secondary"
              disabled={probeState === "loading"}
              onClick={inspectPaymentRequirement}
              type="button"
            >
              {probeState === "loading" ? "Inspecting" : "Inspect 402"}
            </button>
          </div>
        </div>

        <div className="protocol-visual" aria-label="x402 request flow">
          <div className="flow-node client">
            <span>Client</span>
            <strong>GET {status.endpoint}</strong>
          </div>
          <div className="flow-arrow">402</div>
          <div className="flow-node server">
            <span>Resource server</span>
            <strong>PAYMENT-REQUIRED</strong>
          </div>
          <div className="flow-arrow">pay</div>
          <div className="flow-node unlock">
            <span>Unlocked response</span>
            <strong>PAYMENT-RESPONSE</strong>
          </div>
        </div>
      </section>

      <section className="status-grid" aria-label="x402 endpoint status">
        <article>
          <span>Price</span>
          <strong>{status.price}</strong>
        </article>
        <article>
          <span>Mode</span>
          <strong>{status.mode}</strong>
        </article>
        <article>
          <span>Facilitator</span>
          <strong>{status.facilitatorHost}</strong>
        </article>
        <article>
          <span>Status</span>
          <strong>{statusState}</strong>
        </article>
      </section>

      <section className="workbench">
        <div className="panel">
          <div className="section-heading">
            <p className="eyebrow">Endpoint contract</p>
            <h2>{status.endpoint}</h2>
          </div>
          <div className="contract-list">
            <div>
              <span>Scheme</span>
              <strong>exact</strong>
            </div>
            <div>
              <span>Networks</span>
              <strong>{formatNetworks(status.accepts)}</strong>
            </div>
            <div>
              <span>Receiver</span>
              <strong>{status.accepts?.[0]?.payTo || "configured in Worker env"}</strong>
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
                Use the inspect action to fetch the protected resource without a
                payment signature and decode the returned x402 requirements.
              </span>
            </div>
          )}
        </div>
      </section>

      <section className="notes-band" aria-label="Implementation notes">
        <div>
          <p className="eyebrow">What changed</p>
          <h2>The payment is no longer a custom wallet transfer.</h2>
        </div>
        <p>
          The paid route is protected at the Cloudflare edge by x402 middleware.
          Unpaid requests receive HTTP 402 plus payment terms. Paid retries are
          verified and settled through a facilitator before the HTML brief is
          returned.
        </p>
      </section>
    </main>
  );
};

export default App;

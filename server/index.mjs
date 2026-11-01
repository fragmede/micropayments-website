import { serve } from "@hono/node-server";
import app from "./app.mjs";

const publicUrl = new URL(process.env.PUBLIC_ORIGIN || "");
if (
  !["http:", "https:"].includes(publicUrl.protocol) ||
  publicUrl.username ||
  publicUrl.password ||
  publicUrl.pathname !== "/" ||
  publicUrl.search ||
  publicUrl.hash
) {
  throw new Error("PUBLIC_ORIGIN must be an HTTP(S) origin without a path or credentials");
}

const portSetting = process.env.PORT ?? "8789";
const port = Number(portSetting);
if (!/^\d+$/.test(portSetting) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

const server = serve(
  {
    hostname: "127.0.0.1",
    port,
    fetch(request) {
      const incomingUrl = new URL(request.url);
      // The reverse proxy terminates HTTPS. Never trust client-supplied host
      // or forwarding headers when creating the signed payment resource URL.
      const canonicalUrl = `${publicUrl.origin}${incomingUrl.pathname}${incomingUrl.search}`;
      return app.fetch(new Request(canonicalUrl, request), process.env);
    },
  },
  (address) => {
    console.log(`Payment API listening on http://127.0.0.1:${address.port}`);
  },
);

process.once("SIGTERM", () => {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 120_000).unref();
});

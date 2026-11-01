import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { parse } from "smol-toml";

const root = fileURLToPath(new URL("../", import.meta.url));
const configuration = parse(await readFile(`${root}wrangler.toml`, "utf8"));
const paymentEnvironment = Object.entries(configuration.vars ?? {})
  .filter(([name]) => name.startsWith("X402_"))
  .map(([name, value]) => {
    if (!/^X402_[A-Z0-9_]+$/.test(name) || typeof value !== "string" || /[\r\n\0]/.test(value)) {
      throw new Error(`Invalid payment environment setting: ${name}`);
    }
    return `${name}=${JSON.stringify(value)}`;
  })
  .join("\n");

// This folder is a private deployment artifact, separate from public dist/.
await mkdir(`${root}server-dist`, { recursive: true });
await build({
  absWorkingDir: root,
  entryPoints: ["server/index.mjs"],
  outfile: "server-dist/index.mjs",
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  banner: {
    js: 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);',
  },
});
await writeFile(`${root}server-dist/payment.env`, `${paymentEnvironment}\n`, { mode: 0o600 });

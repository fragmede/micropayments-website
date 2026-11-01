import { handle } from "hono/cloudflare-pages";
import app from "../../../server/app.mjs";

export const onRequest = handle(app);

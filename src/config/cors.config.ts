import type { CorsOptions } from "cors";
import { env } from "./env.js";

const origins = env.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const corsOptions: CorsOptions =
  origins.length === 1 && origins[0] === "*" ? {} : { origin: origins };

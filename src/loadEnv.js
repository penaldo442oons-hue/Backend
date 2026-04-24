import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env");

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn(`[env] No .env at ${envPath} — using process env only (${result.error.message})`);
}

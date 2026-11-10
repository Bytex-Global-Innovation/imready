import { rmSync } from "node:fs";
import { join } from "node:path";

const nextDir = join(process.cwd(), ".next");
try {
  rmSync(nextDir, { recursive: true, force: true });
  console.log("[dev:clean] Removed .next");
} catch (error) {
  console.warn("[dev:clean] Could not remove .next:", error);
}

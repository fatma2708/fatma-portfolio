import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const moduleDir = dirname(fileURLToPath(import.meta.url));

/**
 * In dev (tsx) this resolves to `src/knowledge`.
 * In production (compiled to dist) it resolves to `dist/knowledge`,
 * which is populated by scripts/copy-assets.mjs during the build.
 */
export const KNOWLEDGE_DIR = resolve(moduleDir, "..", "knowledge");

import { copyFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fromDir = join(root, "src", "knowledge");
const toDir = join(root, "dist", "knowledge");

mkdirSync(toDir, { recursive: true });

for (const file of readdirSync(fromDir)) {
  if (file.endsWith(".json") && statSync(join(fromDir, file)).isFile()) {
    copyFileSync(join(fromDir, file), join(toDir, file));
  }
}

console.log(`Copied knowledge assets -> ${toDir}`);

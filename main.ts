import { createHash } from "node:crypto";
import { readdirSync, rmSync, readFileSync, writeFileSync } from "node:fs";

const ENTRY = "Senior Apologizer for Self-Driving Cars";
const OUT_DIR = "/output";
const OUT_FILE = `${OUT_DIR}/entry.txt`;

function validateGate(entry: string): void {
  if (typeof entry !== "string") throw new Error("entry must be a string");
  if (entry.length < 1 || entry.length > 60) {
    throw new Error(`entry must be 1-60 chars, got ${entry.length}`);
  }
  if (entry.trim().length === 0) throw new Error("entry must not be only whitespace");
  if (entry !== entry.trim()) throw new Error("entry must not have leading/trailing whitespace");
  if (entry.includes("\n") || entry.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  if (/[\u0000-\u001f\u007f]/.test(entry)) {
    throw new Error("entry must not contain control characters");
  }
  if (entry.charCodeAt(0) === 0xfeff) throw new Error("entry must not start with a BOM");
  const bytes = Buffer.from(entry, "utf8");
  if (bytes.length > 800) throw new Error(`entry exceeds 800 bytes: ${bytes.length}`);
  if (bytes.toString("utf8") !== entry) throw new Error("entry is not a UTF-8 round-trip");
}

function emptyOutputDir(): void {
  for (const name of readdirSync(OUT_DIR)) {
    rmSync(`${OUT_DIR}/${name}`, { recursive: true, force: true });
  }
}

function main(): void {
  validateGate(ENTRY);
  emptyOutputDir();
  writeFileSync(OUT_FILE, ENTRY, "utf8");
  const back = readFileSync(OUT_FILE, "utf8");
  if (back !== ENTRY) throw new Error("read-back mismatch: entry.txt does not hold exactly the entry");
  const sha = createHash("sha256").update(back, "utf8").digest("hex");
  console.log(`wrote ${OUT_FILE} (${ENTRY.length} chars, ${Buffer.byteLength(ENTRY, "utf8")} bytes, sha256 ${sha})`);
  console.log(`entry: ${ENTRY}`);
}

// Fail-fast: validate the entry at module load, before main() runs.
validateGate(ENTRY);

main();

#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { listRecentPlatform, loadDotEnv, missingCredentials, platforms } from "./lib/weekly-platforms.mjs";

const argv = process.argv.slice(2);
const valueAfter = (name) => {
  const index = argv.indexOf(name);
  return index === -1 ? undefined : argv[index + 1];
};
if (argv.includes("--help")) {
  console.log("Usage: node scripts/rebuild-weekly-state.mjs [--output <ignored-json>] [--max-pages <n>]");
  process.exit(0);
}

loadDotEnv();
const missing = missingCredentials();
if (missing.length) throw new Error(`Missing credentials for: ${missing.join(", ")}`);
const maxPages = Number(valueAfter("--max-pages") || 10);
if (!Number.isInteger(maxPages) || maxPages < 1 || maxPages > 100) throw new Error("--max-pages must be an integer from 1 to 100");

const state = { schema_version: 1, rebuilt_at: new Date().toISOString(), canonical_source: "live CMS APIs", platforms: {} };
for (const platform of platforms) {
  state.platforms[platform] = await listRecentPlatform(platform, { maxPages, pageSize: platform === "logosj" ? 50 : 100 });
}

const output = valueAfter("--output");
if (output) {
  const resolved = path.resolve(output);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
  console.log(`Rebuilt ${Object.values(state.platforms).reduce((sum, rows) => sum + rows.length, 0)} records into ${resolved}`);
} else {
  console.log(JSON.stringify(state, null, 2));
}

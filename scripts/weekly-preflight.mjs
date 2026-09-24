#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { listPlatform, loadDotEnv, missingCredentials, platforms } from "./lib/weekly-platforms.mjs";
import { lockStatus } from "./weekly-executor-lock.mjs";

const args = new Set(process.argv.slice(2));
const offline = args.has("--offline");
if (args.has("--help")) {
  console.log("Usage: node scripts/weekly-preflight.mjs [--offline] [--json]");
  process.exit(0);
}

loadDotEnv();
const checks = [];
const check = (name, ok, detail) => checks.push({ name, ok: Boolean(ok), detail });
const required = [
  ".agents/skills/weekly-logo-news-publishing/SKILL.md",
  ".agents/skills/weekly-logo-news-publishing/references/prepublish-audit.md",
  "automations/weekly-logo-news-publishing.prompt.md",
  "automations/logo-blog-growth-strategy.prompt.md",
  "scripts/weekly-publish.mjs",
  "scripts/weekly-executor-lock.mjs",
];

const nodeMajor = Number(process.versions.node.split(".")[0]);
check("node", nodeMajor >= 20, `Node ${process.versions.node}; requires >=20`);
check("repository", required.every((file) => fs.existsSync(path.resolve(file))), "required workflow files present");
try {
  execFileSync("git", ["rev-parse", "--is-inside-work-tree"], { stdio: "ignore" });
  check("git", true, "Git worktree detected");
} catch {
  check("git", false, "not inside a Git worktree");
}
try {
  fs.accessSync(process.cwd(), fs.constants.R_OK | fs.constants.W_OK);
  check("workspace", true, "workspace is readable and writable");
} catch {
  check("workspace", false, "workspace is not readable and writable");
}

const missing = missingCredentials();
check("credentials", missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : "all three API variables are present");
check("executor", Boolean(process.env.WEEKLY_EXECUTOR_ID), process.env.WEEKLY_EXECUTOR_ID ? "WEEKLY_EXECUTOR_ID is present" : "WEEKLY_EXECUTOR_ID is missing");

if (!offline && missing.length === 0) {
  for (const platform of platforms) {
    try {
      const rows = await listPlatform(platform, { pageSize: 1 });
      check(`${platform}:read`, true, `read-only list succeeded (${rows.length} row(s) returned)`);
    } catch (error) {
      check(`${platform}:read`, false, error.message);
    }
  }
  try {
    const status = lockStatus();
    check("remote-lock", true, status.active ? `active lease held by ${status.state.executor_id} until ${status.state.expires_at}` : "remote lock ref is reachable and has no active lease");
  } catch (error) {
    check("remote-lock", false, error.message);
  }
} else {
  check("network", true, offline ? "skipped by --offline" : "skipped because credentials are missing");
}

if (args.has("--json")) console.log(JSON.stringify({ checks }, null, 2));
else for (const item of checks) console.log(`${item.ok ? "PASS" : "FAIL"} ${item.name}: ${item.detail}`);
if (checks.some((item) => !item.ok)) process.exitCode = 1;

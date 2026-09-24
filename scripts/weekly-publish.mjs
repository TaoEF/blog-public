#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { acquireLock, releaseLock } from "./weekly-executor-lock.mjs";
import { assertLivePayload, findDuplicate, listPlatform, loadDotEnv, missingCredentials, platforms, publishPlatform, verifyPublication } from "./lib/weekly-platforms.mjs";

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");

function safePackageFile(packageDir, relative) {
  if (!relative || path.isAbsolute(relative)) throw new Error(`Package file must be relative: ${relative}`);
  const root = path.resolve(packageDir);
  const resolved = path.resolve(root, relative);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) throw new Error(`Package file escapes package root: ${relative}`);
  return resolved;
}

export function loadAndValidatePackage(packageDir) {
  const root = path.resolve(packageDir);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
  if (manifest.schema_version !== 1 || !manifest.week || !Array.isArray(manifest.stories) || !manifest.stories.length) {
    throw new Error("manifest.json must contain schema_version 1, week, and non-empty stories");
  }
  const auditPath = safePackageFile(root, manifest.audit_file || "prepublish-audit.json");
  const audit = JSON.parse(fs.readFileSync(auditPath, "utf8"));
  if (!Array.isArray(audit.entries)) throw new Error("prepublish-audit.json must contain entries[]");
  const keys = new Set();
  const payloads = [];
  for (const story of manifest.stories) {
    if (!story.key || keys.has(story.key)) throw new Error(`Missing or duplicate story key: ${story.key}`);
    keys.add(story.key);
    if (!story.source_url) throw new Error(`${story.key}: source_url is required`);
    for (const platform of platforms) {
      const descriptor = story.payloads?.[platform];
      if (!descriptor?.file || !/^[a-f0-9]{64}$/.test(descriptor.sha256 || "")) throw new Error(`${story.key}:${platform} needs file and lowercase sha256`);
      const file = safePackageFile(root, descriptor.file);
      const raw = fs.readFileSync(file, "utf8");
      const actual = sha256(raw);
      if (actual !== descriptor.sha256) throw new Error(`${story.key}:${platform} payload hash mismatch`);
      const review = audit.entries.find((entry) => entry.article_key === story.key && entry.platform === platform);
      if (!review || review.verdict !== "PASS" || review.payload_sha256 !== actual || !review.reviewer_id || !review.reviewed_at) {
        throw new Error(`${story.key}:${platform} has no current independent PASS`);
      }
      const payload = JSON.parse(raw);
      if (!payload.title || !payload.content) throw new Error(`${story.key}:${platform} payload needs title and content`);
      payloads.push({ storyKey: story.key, sourceUrl: story.source_url, platform, payload, sha256: actual });
    }
  }
  return { root, manifest, audit, payloads };
}

export async function runPackage({ packageDir, mode = "dry-run", confirmLive = false, env = process.env }) {
  if (!["dry-run", "live"].includes(mode)) throw new Error("mode must be dry-run or live");
  loadDotEnv(path.resolve(".env"));
  const missing = missingCredentials(env);
  if (missing.length) throw new Error(`Missing credentials for: ${missing.join(", ")}`);
  if (mode === "live" && !confirmLive) throw new Error("Live mode requires --confirm-live");
  const pack = loadAndValidatePackage(packageDir);
  const report = { schema_version: 1, week: pack.manifest.week, mode, started_at: new Date().toISOString(), results: [] };
  let lease;
  try {
    if (mode === "live") lease = acquireLock({ runId: `${pack.manifest.week}-${crypto.randomUUID()}`, env });
    for (const item of pack.payloads) {
      try {
        const rows = await listPlatform(item.platform, { pageSize: 100, keyword: item.payload.title, env });
        const duplicate = findDuplicate(item.platform, item.payload, rows);
        if (duplicate) {
          report.results.push({ story_key: item.storyKey, platform: item.platform, status: "already_exists", existing_id: duplicate.id ?? duplicate.post_id ?? null });
          continue;
        }
        if (mode === "dry-run") {
          report.results.push({ story_key: item.storyKey, platform: item.platform, status: "ready", payload_sha256: item.sha256 });
          continue;
        }
        assertLivePayload(item.platform, item.payload);
        const published = await publishPlatform(item.platform, item.payload, env);
        try {
          const verification = await verifyPublication(item.platform, item.payload, published, env);
          report.results.push({ story_key: item.storyKey, platform: item.platform, status: "published", ...published, verification, payload_sha256: item.sha256 });
        } catch (error) {
          report.results.push({ story_key: item.storyKey, platform: item.platform, status: "published_unverified", ...published, error: error.message, payload_sha256: item.sha256 });
        }
      } catch (error) {
        report.results.push({ story_key: item.storyKey, platform: item.platform, status: "failed", error: error.message });
      }
    }
  } finally {
    if (lease) {
      try {
        report.lock_release = releaseLock(lease.lease_id, env);
      } catch (error) {
        report.lock_release = { status: "failed", error: error.message };
      }
    }
  }
  report.finished_at = new Date().toISOString();
  const resultPath = path.join(pack.root, "publish-results.json");
  fs.writeFileSync(resultPath, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
  if (report.results.some((row) => ["failed", "published_unverified"].includes(row.status)) || report.lock_release?.status === "failed") process.exitCode = 1;
  return report;
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.includes("--help")) {
    console.log("Usage: node scripts/weekly-publish.mjs --package <dir> [--mode dry-run|live] [--confirm-live]");
    return;
  }
  const valueAfter = (name) => {
    const index = argv.indexOf(name);
    return index === -1 ? undefined : argv[index + 1];
  };
  const packageDir = valueAfter("--package");
  if (!packageDir) throw new Error("--package is required");
  const report = await runPackage({ packageDir, mode: valueAfter("--mode") || "dry-run", confirmLive: argv.includes("--confirm-live") });
  console.log(JSON.stringify(report, null, 2));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

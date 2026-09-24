import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { acquireLock, lockStatus, releaseLock } from "../weekly-executor-lock.mjs";
import { loadAndValidatePackage, runPackage } from "../weekly-publish.mjs";
import { listRecentPlatform } from "../lib/weekly-platforms.mjs";

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");

function makePackage(root) {
  fs.mkdirSync(path.join(root, "payloads"), { recursive: true });
  const entries = [];
  const descriptors = {};
  for (const platform of ["sologo", "logosj", "logomaker"]) {
    const payload = {
      title: `Example ${platform}`,
      content: '<p style="margin:0">Body</p>',
      ...(platform === "sologo" ? { seo_uri: "example-sologo", dict_status: 1 } : {}),
      ...(platform === "logosj" ? { status: "publish" } : {}),
      ...(platform === "logomaker" ? { type: 1, abstract: "Summary", status: 1 } : {}),
    };
    const raw = JSON.stringify(payload);
    const file = `payloads/example-${platform}.json`;
    fs.writeFileSync(path.join(root, file), raw);
    descriptors[platform] = { file, sha256: sha256(raw) };
    entries.push({
      article_key: "example",
      platform,
      reviewer_id: "independent-test-reviewer",
      reviewed_at: "2026-09-24T00:00:00.000Z",
      payload_sha256: sha256(raw),
      verdict: "PASS",
    });
  }
  fs.writeFileSync(path.join(root, "manifest.json"), JSON.stringify({
    schema_version: 1,
    week: "2026-W40",
    audit_file: "prepublish-audit.json",
    stories: [{ key: "example", source_url: "https://example.com/source", payloads: descriptors }],
  }));
  fs.writeFileSync(path.join(root, "prepublish-audit.json"), JSON.stringify({ entries }));
}

test("package validation rejects a payload changed after audit", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "weekly-package-"));
  makePackage(root);
  assert.equal(loadAndValidatePackage(root).payloads.length, 3);
  fs.appendFileSync(path.join(root, "payloads/example-sologo.json"), "\n");
  assert.throws(() => loadAndValidatePackage(root), /payload hash mismatch/);
});

test("dry run performs only list requests and writes a report", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "weekly-dry-run-"));
  makePackage(root);
  const requests = [];
  const server = http.createServer((request, response) => {
    requests.push({ method: request.method, url: request.url });
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify(request.url.startsWith("/logosj/") ? { posts: [] } : { status: 0, data: { list: [] } }));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}`;
  const env = {
    SOLOGO_BLOG_API_KEY: "test",
    LOGOSJ_WP_API_KEY: "test",
    LOGOMAKER_DESIGN_SCHOOL_API_KEY: "test",
    WEEKLY_SOLOGO_API_BASE: `${base}/sologo?op=blog_post`,
    WEEKLY_LOGOSJ_API_BASE: `${base}/logosj`,
    WEEKLY_LOGOMAKER_API_BASE: `${base}/logomaker?op=design_school`,
  };
  const report = await runPackage({ packageDir: root, mode: "dry-run", env });
  assert.deepEqual(report.results.map((item) => item.status), ["ready", "ready", "ready"]);
  assert.equal(requests.length, 3);
  assert.equal(requests.some((item) => /create|publish|update|delete|unpublish/.test(item.url)), false);
  assert.equal(fs.existsSync(path.join(root, "publish-results.json")), true);
});

test("live mode refuses to start without explicit confirmation", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "weekly-live-gate-"));
  makePackage(root);
  await assert.rejects(() => runPackage({
    packageDir: root,
    mode: "live",
    env: {
      SOLOGO_BLOG_API_KEY: "test",
      LOGOSJ_WP_API_KEY: "test",
      LOGOMAKER_DESIGN_SCHOOL_API_KEY: "test",
    },
  }), /requires --confirm-live/);
});

test("state rebuild follows platform pagination", async (t) => {
  let requests = 0;
  const server = http.createServer((request, response) => {
    requests += 1;
    const page = Number(new URL(request.url, "http://local").searchParams.get("page"));
    const count = page === 1 ? 50 : page === 2 ? 25 : 0;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ posts: Array.from({ length: count }, (_, index) => ({ id: (page - 1) * 50 + index + 1, title: `Post ${(page - 1) * 50 + index + 1}` })) }));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => server.close());
  const rows = await listRecentPlatform("logosj", {
    pageSize: 50,
    maxPages: 10,
    env: { LOGOSJ_WP_API_KEY: "test", WEEKLY_LOGOSJ_API_BASE: `http://127.0.0.1:${server.address().port}` },
  });
  assert.equal(rows.length, 75);
  assert.equal(requests, 2);
});

test("remote Git lease permits only one executor and preserves history", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "weekly-lock-"));
  const repo = path.join(root, "repo");
  const bare = path.join(root, "remote.git");
  fs.mkdirSync(repo);
  execFileSync("git", ["init", "--quiet", "--bare", bare]);
  execFileSync("git", ["init", "--quiet"], { cwd: repo });
  const previous = process.cwd();
  process.chdir(repo);
  try {
    const common = { WEEKLY_LOCK_REMOTE: bare };
    const first = acquireLock({ env: { ...common, WEEKLY_EXECUTOR_ID: "computer-a" }, ttlMinutes: 5, runId: "run-a" });
    assert.equal(lockStatus({ ...common, WEEKLY_EXECUTOR_ID: "computer-a" }).active, true);
    assert.throws(() => acquireLock({ env: { ...common, WEEKLY_EXECUTOR_ID: "computer-b" }, ttlMinutes: 5, runId: "run-b" }), /held by computer-a/);
    releaseLock(first.lease_id, { ...common, WEEKLY_EXECUTOR_ID: "computer-a" });
    const second = acquireLock({ env: { ...common, WEEKLY_EXECUTOR_ID: "computer-b" }, ttlMinutes: 5, runId: "run-b" });
    releaseLock(second.lease_id, { ...common, WEEKLY_EXECUTOR_ID: "computer-b" });
    const count = Number(execFileSync("git", ["--git-dir", bare, "rev-list", "--count", "refs/heads/automation/weekly-logo-news-lock"], { encoding: "utf8" }).trim());
    assert.equal(count, 4);
  } finally {
    process.chdir(previous);
  }
});

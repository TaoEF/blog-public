#!/usr/bin/env node
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const defaultRef = "refs/heads/automation/weekly-logo-news-lock";

function git(args, options = {}) {
  return execFileSync("git", args, { encoding: "utf8", ...options }).trim();
}

function config(env = process.env) {
  return {
    remote: env.WEEKLY_LOCK_REMOTE || "origin",
    ref: env.WEEKLY_LOCK_REF || defaultRef,
    executorId: env.WEEKLY_EXECUTOR_ID,
  };
}

function remoteSha(remote, ref) {
  const line = git(["ls-remote", "--heads", remote, ref]);
  return line ? line.split(/\s+/)[0] : null;
}

function readState(remote, ref, sha) {
  if (!sha) return null;
  git(["fetch", "--quiet", remote, ref]);
  return JSON.parse(git(["show", `${sha}:lock.json`]));
}

function commitState(state, parent) {
  const raw = `${JSON.stringify(state, null, 2)}\n`;
  const blob = git(["hash-object", "-w", "--stdin"], { input: raw });
  const tree = git(["mktree"], { input: `100644 blob ${blob}\tlock.json\n` });
  const args = ["commit-tree", tree];
  if (parent) args.push("-p", parent);
  return git(args, {
    input: `weekly publisher lock: ${state.state} ${state.lease_id || "none"}\n`,
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: process.env.GIT_AUTHOR_NAME || "Weekly Publisher Lock",
      GIT_AUTHOR_EMAIL: process.env.GIT_AUTHOR_EMAIL || "weekly-publisher@local.invalid",
      GIT_COMMITTER_NAME: process.env.GIT_COMMITTER_NAME || "Weekly Publisher Lock",
      GIT_COMMITTER_EMAIL: process.env.GIT_COMMITTER_EMAIL || "weekly-publisher@local.invalid",
    },
  });
}

function pushState(remote, ref, oldSha, commit) {
  const lease = oldSha ? `--force-with-lease=${ref}:${oldSha}` : `--force-with-lease=${ref}:`;
  git(["push", "--quiet", lease, remote, `${commit}:${ref}`]);
}

export function lockStatus(env = process.env) {
  const { remote, ref } = config(env);
  const sha = remoteSha(remote, ref);
  const state = readState(remote, ref, sha);
  return { remote, ref, sha, state, active: Boolean(state?.state === "active" && Date.parse(state.expires_at) > Date.now()) };
}

export function acquireLock({ ttlMinutes = 180, runId = crypto.randomUUID(), env = process.env } = {}) {
  const { remote, ref, executorId } = config(env);
  if (!executorId) throw new Error("WEEKLY_EXECUTOR_ID is required");
  if (!Number.isFinite(ttlMinutes) || ttlMinutes < 5 || ttlMinutes > 1440) throw new Error("Lock TTL must be between 5 and 1440 minutes");
  const oldSha = remoteSha(remote, ref);
  const previous = readState(remote, ref, oldSha);
  if (previous?.state === "active" && Date.parse(previous.expires_at) > Date.now()) {
    throw new Error(`Live publisher lock is held by ${previous.executor_id} until ${previous.expires_at}`);
  }
  const now = new Date();
  const state = {
    schema_version: 1,
    state: "active",
    executor_id: executorId,
    lease_id: crypto.randomUUID(),
    run_id: runId,
    acquired_at: now.toISOString(),
    expires_at: new Date(now.getTime() + ttlMinutes * 60_000).toISOString(),
    previous_lease_id: previous?.lease_id || null,
  };
  const commit = commitState(state, oldSha);
  pushState(remote, ref, oldSha, commit);
  return { ...state, remote, ref, commit };
}

export function releaseLock(leaseId, env = process.env) {
  if (!leaseId) throw new Error("lease id is required");
  const { remote, ref, executorId } = config(env);
  const oldSha = remoteSha(remote, ref);
  const previous = readState(remote, ref, oldSha);
  if (!previous || previous.state !== "active") throw new Error("No active live publisher lock exists");
  if (previous.lease_id !== leaseId || previous.executor_id !== executorId) throw new Error("Lock owner or lease id does not match");
  const state = { ...previous, state: "released", released_at: new Date().toISOString() };
  const commit = commitState(state, oldSha);
  pushState(remote, ref, oldSha, commit);
  return { ...state, remote, ref, commit };
}

async function main() {
  const [command, ...argv] = process.argv.slice(2);
  if (!command || command === "--help") {
    console.log("Usage: node scripts/weekly-executor-lock.mjs status|acquire|release [--ttl-minutes n] [--lease-id id]");
    return;
  }
  if (command === "status") {
    console.log(JSON.stringify(lockStatus(), null, 2));
    return;
  }
  if (command === "acquire") {
    const index = argv.indexOf("--ttl-minutes");
    const ttlMinutes = index === -1 ? 180 : Number(argv[index + 1]);
    console.log(JSON.stringify(acquireLock({ ttlMinutes }), null, 2));
    return;
  }
  if (command === "release") {
    const index = argv.indexOf("--lease-id");
    console.log(JSON.stringify(releaseLock(index === -1 ? process.env.WEEKLY_LOCK_LEASE_ID : argv[index + 1]), null, 2));
    return;
  }
  throw new Error(`Unknown command: ${command}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

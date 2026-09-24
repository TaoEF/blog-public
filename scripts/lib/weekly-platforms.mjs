import fs from "node:fs";
import path from "node:path";

export const platforms = ["sologo", "logosj", "logomaker"];

const defaultBases = {
  sologo: "https://www.sologo.ai/api.php?op=blog_post",
  logosj: "https://www.logosj.com/wp-json/ai-publisher/v1",
  logomaker: "https://www.logomaker.com.cn/api.php?op=design_school",
};

export function loadDotEnv(file = path.resolve(".env")) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, "$2");
  }
}

export function credentials(env = process.env) {
  return {
    sologo: env.SOLOGO_BLOG_API_KEY,
    logosj: env.LOGOSJ_WP_API_KEY,
    logomaker: env.LOGOMAKER_DESIGN_SCHOOL_API_KEY,
  };
}

export function missingCredentials(env = process.env) {
  const values = credentials(env);
  return platforms.filter((platform) => !values[platform]);
}

function bases(env = process.env) {
  return {
    sologo: env.WEEKLY_SOLOGO_API_BASE || defaultBases.sologo,
    logosj: env.WEEKLY_LOGOSJ_API_BASE || defaultBases.logosj,
    logomaker: env.WEEKLY_LOGOMAKER_API_BASE || defaultBases.logomaker,
  };
}

export async function requestJson(url, options = {}, label = url) {
  const response = await fetch(url, {
    ...options,
    signal: options.signal || AbortSignal.timeout(45_000),
  });
  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(`${label}: expected JSON, received HTTP ${response.status}`);
  }
  if (!response.ok || body?.success === false || (typeof body?.status === "number" && body.status !== 0)) {
    const message = body?.message || body?.msg || body?.code || `HTTP ${response.status}`;
    throw new Error(`${label}: ${message}`);
  }
  return body;
}

function unwrapRows(body) {
  const data = body?.data ?? body;
  if (Array.isArray(data)) return data;
  for (const key of ["list", "rows", "posts", "items", "docs"]) {
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(body?.[key])) return body[key];
  }
  return [];
}

export async function listPlatform(platform, { page = 1, pageSize = 100, keyword = "", env = process.env } = {}) {
  const keys = credentials(env);
  const api = bases(env);
  if (!keys[platform]) throw new Error(`Missing credential for ${platform}`);

  if (platform === "sologo") {
    const url = new URL(api.sologo);
    url.searchParams.set("act", "list");
    url.searchParams.set("page", String(page));
    url.searchParams.set("pagesize", String(pageSize));
    if (keyword) url.searchParams.set("keyword", keyword);
    return unwrapRows(await requestJson(url, { headers: { "X-API-Key": keys.sologo } }, "sologo:list"));
  }

  if (platform === "logosj") {
    const url = new URL(`${api.logosj.replace(/\/$/, "")}/posts`);
    url.searchParams.set("page", String(page));
    url.searchParams.set("per_page", String(pageSize));
    if (keyword) url.searchParams.set("search", keyword);
    return unwrapRows(await requestJson(url, { headers: { "X-API-Key": keys.logosj } }, "logosj:list"));
  }

  const url = new URL(api.logomaker);
  url.searchParams.set("act", "lists");
  return unwrapRows(await requestJson(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-APP-Key": keys.logomaker },
    body: JSON.stringify({ page, pagesize: pageSize, keyword, order: "id", sortby: "desc" }),
  }, "logomaker:lists"));
}

export function normalizedPost(platform, row) {
  const title = typeof row?.title === "object" ? row.title.rendered : row?.title;
  const slug = row?.seo_uri || row?.slug || row?.post_name || null;
  const id = Number(row?.id ?? row?.post_id ?? row?.article_id);
  let url = row?.url || row?.link || row?.post_url || null;
  if (!url && platform === "sologo" && slug) url = `https://www.sologo.ai/blog/${slug}/`;
  if (!url && platform === "logomaker" && Number.isFinite(id)) url = `https://www.logomaker.com.cn/strategy/info/${id}/`;
  return {
    platform,
    id: Number.isFinite(id) ? id : null,
    title: title || null,
    slug,
    url,
    status: row?.status ?? row?.dict_status ?? row?.post_status ?? null,
    published_at: row?.ptime || row?.published_at || row?.date || row?.post_date || null,
  };
}

export async function listRecentPlatform(platform, { maxPages = 10, pageSize = 100, env = process.env } = {}) {
  const result = [];
  const seen = new Set();
  for (let page = 1; page <= maxPages; page += 1) {
    const rows = await listPlatform(platform, { page, pageSize, env });
    let added = 0;
    for (const row of rows) {
      const item = normalizedPost(platform, row);
      const key = `${item.id ?? ""}\u0000${item.slug ?? ""}\u0000${item.title ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(item);
      added += 1;
    }
    if (rows.length < pageSize) break;
    if (rows.length && added === 0) break;
  }
  return result;
}

export function payloadIdentity(platform, payload) {
  return {
    title: payload?.title?.trim(),
    slug: platform === "sologo" ? payload?.seo_uri?.trim() : undefined,
  };
}

export function findDuplicate(platform, payload, rows) {
  const wanted = payloadIdentity(platform, payload);
  return rows.find((row) => {
    const item = normalizedPost(platform, row);
    return (wanted.title && item.title === wanted.title) ||
      (platform === "sologo" && wanted.slug && item.slug === wanted.slug);
  });
}

export async function publishPlatform(platform, payload, env = process.env) {
  const keys = credentials(env);
  const api = bases(env);
  if (platform === "sologo") {
    const createUrl = new URL(api.sologo);
    createUrl.searchParams.set("act", "create");
    const created = await requestJson(createUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": keys.sologo },
      body: JSON.stringify(payload),
    }, "sologo:create");
    const id = Number(created?.data?.id ?? created?.data?.article_id ?? created?.data);
    if (!Number.isFinite(id)) throw new Error("sologo:create returned no numeric id");
    if (Number(payload.dict_status) === 1) {
      const publishUrl = new URL(api.sologo);
      publishUrl.searchParams.set("act", "publish");
      await requestJson(publishUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": keys.sologo },
        body: JSON.stringify({ id, status: 1 }),
      }, "sologo:publish");
    }
    return { id, url: payload.seo_uri ? `https://www.sologo.ai/blog/${payload.seo_uri}/` : null };
  }

  if (platform === "logosj") {
    const result = await requestJson(`${api.logosj.replace(/\/$/, "")}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": keys.logosj },
      body: JSON.stringify(payload),
    }, "logosj:publish");
    if (result?.images_failed?.length) throw new Error(`logosj:publish failed to import ${result.images_failed.length} image(s)`);
    return { id: Number(result?.post_id), url: result?.post_url || null };
  }

  const url = new URL(api.logomaker);
  url.searchParams.set("act", "publish");
  const result = await requestJson(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-APP-Key": keys.logomaker },
    body: JSON.stringify(payload),
  }, "logomaker:publish");
  const id = Number(result?.data?.id ?? result?.data?.article_id ?? result?.data);
  return { id, url: Number.isFinite(id) ? `https://www.logomaker.com.cn/strategy/info/${id}/` : null };
}

export function assertLivePayload(platform, payload) {
  if (platform === "sologo" && Number(payload.dict_status) !== 1) throw new Error("sologo live payload must use dict_status=1");
  if (platform === "logosj" && payload.status !== "publish") throw new Error('logosj live payload must use status="publish"');
  if (platform === "logomaker" && Number(payload.status) !== 1) throw new Error("logomaker live payload must use status=1");
}

export async function verifyPublication(platform, payload, published, env = process.env) {
  if (!published?.url || !Number.isFinite(Number(published.id))) throw new Error(`${platform}: publish response has no verifiable id/url`);
  const rows = await listPlatform(platform, { pageSize: 100, keyword: payload.title, env });
  const listedRow = rows.find((row) => {
    const item = normalizedPost(platform, row);
    return item.id === Number(published.id) && item.title === payload.title;
  });
  if (!listedRow) throw new Error(`${platform}: published id/title is not visible in the list API`);
  const listed = normalizedPost(platform, listedRow);
  if (platform === "sologo" && !listed.published_at) throw new Error("sologo: published article has no ptime");

  const response = await fetch(published.url, { signal: AbortSignal.timeout(45_000) });
  const html = await response.text();
  if (!response.ok) throw new Error(`${platform}: public URL returned HTTP ${response.status}`);
  const titleNeedle = payload.title.slice(0, Math.min(payload.title.length, 12));
  if (titleNeedle && !html.includes(titleNeedle)) throw new Error(`${platform}: public page does not contain the published title`);
  if (/<img\b/i.test(payload.content) && !/<(?:img|v-img)\b/i.test(html)) throw new Error(`${platform}: public page contains no rendered image element`);
  return { listed: true, public_url: published.url, title: payload.title };
}

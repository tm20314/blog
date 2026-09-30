import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
const site = new URL(process.env.SITE_CHECK_ORIGIN || "https://tumolog.com");
assert.ok(["https:", "http:"].includes(site.protocol));
const get = (path, options = {}) => fetch(new URL(path, site), { signal: AbortSignal.timeout(15_000), redirect: "manual", ...options });
const sitemap = await get("/sitemap-0.xml"); assert.equal(sitemap.status, 200);
const doc = new JSDOM(await sitemap.text(), { contentType: "application/xml" }).window.document;
const urls = [...doc.querySelectorAll("loc")].map((loc) => new URL(loc.textContent)).filter((url) => url.pathname.startsWith("/posts/"));
assert.ok(urls.length, "No posts in sitemap");
if (process.env.EXPECTED_POST_COUNT) assert.equal(urls.length, Number(process.env.EXPECTED_POST_COUNT));
for (const url of urls) {
	const response = await get(url.pathname); assert.equal(response.status, 200, url.pathname);
	const html = new JSDOM(await response.text()).window.document;
	assert.equal(html.querySelector('link[rel="canonical"]').href, `https://tumolog.com${url.pathname}`);
}
assert.equal((await get(`/check-not-found-${Date.now()}/`)).status, 404, "Soft 404");
for (const path of ["/preview/", "/editor/"]) {
	const response = await get(path); assert.equal(response.status, 200);
	assert.match(response.headers.get("cache-control") || "", /no-store/u);
	const html = new JSDOM(await response.text()).window.document;
	assert.match(html.querySelector('meta[name="robots"]').content, /noindex/u);
}
const rejected = await get("/api/preview", { method: "POST", headers: { Origin: "https://invalid.example", "Content-Type": "application/json" }, body: "{}" });
assert.equal(rejected.status, 403);
console.log(`Public smoke check passed: ${urls.length} articles, real HTTP 404 and private preview/editor. No draft was fetched or modified.`);

import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { JSDOM } from "jsdom";
const root = path.resolve("dist");
const posts = await readdir(path.join(root, "posts"));
assert.ok(posts.length > 0, "No public posts");
const searchHtml = await readFile(path.join(root, "search", "index.html"), "utf8");
assert.doesNotMatch(searchHtml, /__VITE_PRELOAD__/u, "Search import must remain native");
for (const slug of posts) {
	const doc = new JSDOM(await readFile(path.join(root, "posts", slug, "index.html"), "utf8")).window.document;
	assert.equal(doc.querySelectorAll("h1").length, 1, `${slug}: h1`);
	assert.equal(doc.querySelector('link[rel="canonical"]').href, `https://tumolog.com/posts/${slug}/`);
	const description = doc.querySelector('meta[name="description"]').content;
	assert.ok(description.length && description !== doc.querySelector("h1").textContent.trim(), `${slug}: description`);
	for (const node of doc.querySelectorAll('script[type="application/ld+json"]')) JSON.parse(node.textContent);
	for (const link of doc.querySelectorAll("[data-toc-link]")) assert.ok(doc.getElementById(decodeURIComponent(link.hash.slice(1))), `${slug}: missing heading ${link.hash}`);
	const image = new URL(doc.querySelector('meta[property="og:image"]').content);
	if (image.pathname.startsWith("/og/")) assert.ok((await stat(path.join(root, image.pathname))).size < 500_000, `${slug}: OG size`);
}
const missing = new JSDOM(await readFile(path.join(root, "404.html"), "utf8")).window.document;
assert.match(missing.querySelector('meta[name="robots"]').content, /noindex/u);
for (const page of ["preview", "editor"]) {
	const doc = new JSDOM(await readFile(path.join(root, page, "index.html"), "utf8")).window.document;
	assert.match(doc.querySelector('meta[name="robots"]').content, /noindex/u);
	assert.equal(doc.querySelector('script[src*="googletagmanager"]'), null);
}
await stat(path.join(root, "pagefind", "pagefind.js"));
const xml = await readFile(path.join(root, "sitemap-0.xml"), "utf8");
assert.equal((xml.match(/<lastmod>/gu) || []).length, posts.length);
assert.doesNotMatch(xml, /<loc>[^<]*(?:preview|editor|search|404)\//u);
for (const name of ["flutter", "ios", "career"]) {
	const doc = new JSDOM(await readFile(path.join(root, "category", name, "index.html"), "utf8")).window.document;
	assert.ok(doc.querySelectorAll(".article-card").length >= 2, `${name}: thin category`);
	assert.equal(doc.querySelector('link[rel="canonical"]').href, `https://tumolog.com/category/${name}/`);
}
console.log(`Build smoke check passed: ${posts.length} posts, descriptions, 3 categories, 404, TOC, JSON-LD, OG, sitemap and search.`);

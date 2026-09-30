import type { APIContext } from "astro";
import { categoryPages } from "../config/categories";
import { publication } from "../config/site";
import { getSortedPosts } from "../utils/content-utils";

const escapeXml = (value: string) =>
	value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&apos;");
export async function GET({ site }: APIContext) {
	const origin = site ?? publication.origin;
	const pages: { path: string; lastmod?: Date }[] = [
		"/",
		"/about/",
		"/archive/",
		"/privacy/",
		...categoryPages.map((page) => `/category/${page.slug}/`),
	].map((path) => ({ path }));
	for (const post of await getSortedPosts())
		pages.push({
			path: `/posts/${post.slug}/`,
			lastmod: post.data.updated ?? post.data.published,
		});
	const urls = pages
		.map(
			(page) =>
				`<url><loc>${escapeXml(new URL(page.path, origin).href)}</loc>${page.lastmod ? `<lastmod>${page.lastmod.toISOString()}</lastmod>` : ""}</url>`,
		)
		.join("");
	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
		{ headers: { "Content-Type": "application/xml; charset=utf-8" } },
	);
}

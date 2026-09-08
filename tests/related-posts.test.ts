import type { CollectionEntry } from "astro:content";
import assert from "node:assert/strict";
import test from "node:test";
import { selectRelatedPosts } from "../src/utils/related-posts";

type Post = CollectionEntry<"posts">;

function post(
	slug: string,
	category: string,
	tags: string[],
	published: string,
): Post {
	return {
		id: `${slug}.md`,
		slug,
		body: "",
		collection: "posts",
		data: {
			title: slug,
			published: new Date(published),
			draft: false,
			description: "",
			image: "",
			tags,
			category,
			lang: "",
			prevTitle: "",
			prevSlug: "",
			nextTitle: "",
			nextSlug: "",
		},
		render: async () => ({
			Content: (() => null) as never,
			headings: [],
			remarkPluginFrontmatter: {},
		}),
	} as Post;
}

test("related posts prioritize shared tags, then category and recency", () => {
	const current = post(
		"current",
		"ガジェット",
		["iPhone", "充電"],
		"2026-09-01",
	);
	const sameTag = post("same-tag", "雑記", ["iPhone"], "2026-07-01");
	const sameCategory = post("same-category", "ガジェット", [], "2026-08-01");
	const unrelated = post("unrelated", "開発", ["Astro"], "2026-09-02");

	assert.deepEqual(
		selectRelatedPosts(current, [
			unrelated,
			sameCategory,
			sameTag,
			current,
		]).map((post) => post.slug),
		["same-tag", "same-category", "unrelated"],
	);
});

test("related posts respect the requested limit", () => {
	const current = post("current", "ガジェット", [], "2026-09-01");
	const candidates = [
		post("one", "ガジェット", [], "2026-09-02"),
		post("two", "ガジェット", [], "2026-09-03"),
	];

	assert.equal(selectRelatedPosts(current, candidates, 1).length, 1);
});

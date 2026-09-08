import assert from "node:assert/strict";
import test from "node:test";
import { onRequest } from "../functions/_middleware.js";

test("Cloudflare Pages hosts permanently redirect to the custom domain", async () => {
	const response = await onRequest({
		request: new Request(
			"https://codex-editorial-rebuild.tm20314-blog.pages.dev/posts/example/?ref=test",
		),
		next: () => new Response("not reached"),
	});

	assert.equal(response.status, 301);
	assert.equal(
		response.headers.get("location"),
		"https://tumolog.com/posts/example/?ref=test",
	);
});

test("the custom domain continues to the static site", async () => {
	const response = await onRequest({
		request: new Request("https://tumolog.com/posts/example/"),
		next: () => new Response("site response", { status: 200 }),
	});

	assert.equal(response.status, 200);
	assert.equal(await response.text(), "site response");
});

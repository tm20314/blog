import assert from "node:assert/strict";
import test from "node:test";
import { onRequestPost } from "../functions/api/preview.js";

const env = {
	MICROCMS_SERVICE_DOMAIN: "example",
	MICROCMS_API_ENDPOINT: "blogs",
	MICROCMS_API_KEY: "test-read-key",
};

test("下書きキーをサーバー側からmicroCMSへ渡す", async () => {
	let requestedUrl;
	let requestedHeaders;
	const response = await onRequestPost({
		request: new Request("https://tumolog.com/api/preview", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				contentId: "article_01",
				draftKey: "draft-secret",
			}),
		}),
		env,
		data: {
			fetch: async (url, options) => {
				requestedUrl = url;
				requestedHeaders = options.headers;
				return Response.json({ id: "article_01", title: "下書き" });
			},
		},
	});

	assert.equal(response.status, 200);
	assert.equal(
		response.headers.get("cache-control"),
		"private, no-store, max-age=0",
	);
	assert.equal(
		response.headers.get("x-robots-tag"),
		"noindex, nofollow, noarchive",
	);
	assert.equal(requestedUrl.hostname, "example.microcms.io");
	assert.equal(requestedUrl.searchParams.get("draftKey"), "draft-secret");
	assert.equal(requestedHeaders["X-MICROCMS-API-KEY"], "test-read-key");
	assert.deepEqual(await response.json(), {
		id: "article_01",
		title: "下書き",
	});
});

test("不正または不足したパラメータをmicroCMSへ送らない", async () => {
	let called = false;
	const response = await onRequestPost({
		request: new Request("https://tumolog.com/api/preview", {
			method: "POST",
			body: JSON.stringify({ contentId: "../secret", draftKey: "" }),
		}),
		env,
		data: {
			fetch: async () => {
				called = true;
			},
		},
	});

	assert.equal(response.status, 400);
	assert.equal(called, false);
});

test("設定不足と上流エラーで秘密情報を返さない", async () => {
	const missingConfig = await onRequestPost({
		request: new Request("https://tumolog.com/api/preview", {
			method: "POST",
			body: JSON.stringify({ contentId: "article", draftKey: "draft" }),
		}),
		env: {},
	});
	assert.equal(missingConfig.status, 503);
	assert.doesNotMatch(await missingConfig.text(), /draft|test-read-key/u);

	const upstreamError = await onRequestPost({
		request: new Request("https://tumolog.com/api/preview", {
			method: "POST",
			body: JSON.stringify({ contentId: "article", draftKey: "draft" }),
		}),
		env,
		data: {
			fetch: async () => new Response("internal secret", { status: 500 }),
		},
	});
	assert.equal(upstreamError.status, 502);
	assert.doesNotMatch(
		await upstreamError.text(),
		/internal secret|test-read-key/u,
	);
});

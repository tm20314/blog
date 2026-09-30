import test from "node:test";
import assert from "node:assert/strict";
import { createPreviewLimiter, readPreviewPayload } from "../functions/lib/preview-limits.js";
import { onRequestPost } from "../functions/api/preview.js";
import { onRequest } from "../functions/_middleware.js";

test("本文サイズはContent-Lengthに依存せずUTF-8バイトで制限する", async () => {
	await assert.rejects(() => readPreviewPayload(new Request("https://tumolog.com/api/preview", { method: "POST", body: JSON.stringify({ text: "あ".repeat(1500) }) })), RangeError);
});
test("プレビューの429・413は上流を呼ばず秘密を返さない", async () => {
	for (const [body, allowRequest, status] of [["{}", () => false, 429], ["x".repeat(4097), () => true, 413]]) {
		const response = await onRequestPost({ request: new Request("https://tumolog.com/api/preview", { method: "POST", body }), env: {}, data: { allowRequest, fetch: () => assert.fail("No upstream") } });
		assert.equal(response.status, status);
		assert.match(response.headers.get("cache-control"), /no-store/u);
	}
});
test("制限はIPごとに独立し時間経過で解除、メモリ上限を持つ", () => {
	let time = 0;
	const allow = createPreviewLimiter({ limit: 2, capacity: 2, interval: 100, now: () => time });
	assert.equal(allow("a"), true); assert.equal(allow("a"), true); assert.equal(allow("a"), false);
	assert.equal(allow("b"), true); assert.equal(allow("c"), false);
	time = 101; assert.equal(allow("a"), true); assert.equal(allow("c"), true);
});
test("公開ページと埋め込みエディターのframe-ancestorsを分離する", async () => {
	for (const [path, expected] of [["/", "'self'"], ["/editor/", "https://tumolog.microcms.io"]]) {
		const response = await onRequest({ request: new Request(`https://tumolog.com${path}`), next: () => new Response("OK") });
		assert.match(response.headers.get("content-security-policy"), new RegExp(expected.replaceAll(".", "\\.")));
		assert.match(response.headers.get("strict-transport-security"), /max-age=/u);
		assert.ok(response.headers.get("content-security-policy-report-only"));
	}
});

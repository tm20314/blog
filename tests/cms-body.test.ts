import assert from "node:assert/strict";
import test from "node:test";
import { isLiveBody, selectCMSBody } from "../src/utils/cms-body";
import { normalizeMicroCMSArticle } from "../src/lib/microcms";

const product = { fieldId: "product", name: "AQUOS", amazonUrl: "https://amzn.to/example" };
const rich = (body: string) => ({ fieldId: "richText", body });

test("本文の段落間に商品を入れ、末尾には重複させない", () => {
	const body = { content: "<h2>前半</h2><p>[[product:1]]</p><p>後半</p>", blocks: [{ fieldId: "speech", body: "補足" }, product] };
	const before = structuredClone(body);
	assert.deepEqual(selectCMSBody(body), [rich("<h2>前半</h2>"), product, rich("<p>後半</p>"), body.blocks[0]]);
	assert.deepEqual(body, before);
});

test("番号は商品のみで数え、順番の変更と同じ商品の再掲に対応", () => {
	const other = { ...product, name: "2個目" };
	assert.deepEqual(selectCMSBody({ content: "<p>[[product:2]]</p><p>[[product:1]]</p><p>[[product:2]]</p>", blocks: [product, other] }), [other, product, other]);
});

test("不明な番号・引用やコード内・装飾された記号は本文として残す", () => {
	for (const content of ["<p>[[product:9]]</p>", "<blockquote><p>[[product:1]]</p></blockquote>", "<pre>[[product:1]]</pre>", "<p><strong>[[product:1]]</strong></p>", "<p>ここに[[product:1]]を書く</p>"]) {
		assert.deepEqual(selectCMSBody({ content, blocks: [product] }), [rich(content), product]);
	}
});

test("既存の並べ替え式ブロックがあれば従来通り優先する", () => {
	const blocks = [rich("<p>別の本文</p>"), product];
	assert.deepEqual(selectCMSBody({ content: "<p>元本文</p>", blocks }), blocks);
});

test("新エディタの明示的な有効化だけが本文を切り替える", () => {
	const legacy = { content: "<p>元本文</p>", blocks: [product] };
	const liveBody = { version: 1, enabled: false, blocks: [rich("<p>新本文</p>")] };
	assert.deepEqual(selectCMSBody({ ...legacy, liveBody }), [rich(legacy.content), product]);
	assert.deepEqual(selectCMSBody({ ...legacy, liveBody: { ...liveBody, enabled: true } }), liveBody.blocks);
	assert.deepEqual(selectCMSBody({ ...legacy, liveBody: { ...liveBody, enabled: true, blocks: [] } }), []);
	assert.equal(isLiveBody({ version: 2, enabled: true, blocks: [] }), false);
	assert.equal(isLiveBody({ version: 1, enabled: true, blocks: [{ fieldId: "unknown" }] }), false);
});

test("公開用normalizerも商品と本文の順番を保つ", () => {
	const article = normalizeMicroCMSArticle({ id: "fixture", title: "変更しない", slug: "fixture", createdAt: "2026-09-14", updatedAt: "2026-09-14", content: "<p>前</p><p>[[product:1]]</p><p>後</p>", blocks: [product] });
	assert.equal(article?.title, "変更しない");
	assert.deepEqual(article?.blocks.map((block) => block.fieldId), ["richText", "product", "richText"]);
});

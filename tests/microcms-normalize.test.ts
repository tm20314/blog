import assert from "node:assert/strict";
import test from "node:test";
import { normalizeMicroCMSArticle } from "../src/lib/microcms";

test("microCMSの記事と編集用ブロックを表示形式へ変換する", () => {
	const article = normalizeMicroCMSArticle({
		id: "sample",
		createdAt: "2026-09-09T00:00:00.000Z",
		updatedAt: "2026-09-09T01:00:00.000Z",
		title: "テスト記事",
		slug: "/microcms-test/",
		content: "<p>導入文</p>",
		category: { id: "gadget", name: "ガジェット" },
		tagsText: "iPhone\nレビュー",
		blocks: [
			{
				fieldId: "box",
				tone: "unknown",
				title: "ポイント",
				body: "<p>本文</p>",
			},
			{
				fieldId: "stepList",
				title: "設定手順",
				itemsText: "開く｜設定を開く\n保存｜変更を保存する",
			},
			{
				fieldId: "product",
				name: "商品",
				amazonUrl: "https://www.amazon.co.jp/example",
				officialUrl: "https://example.com",
			},
		],
	});

	assert.ok(article);
	assert.equal(article.slug, "microcms-test");
	assert.equal(article.category, "ガジェット");
	assert.equal(article.blocks[0].fieldId, "richText");
	assert.deepEqual(article.blocks[2], {
		fieldId: "stepList",
		title: "設定手順",
		items: [
			{ title: "開く", body: "設定を開く" },
			{ title: "保存", body: "変更を保存する" },
		],
	});
	assert.deepEqual(article.blocks[3], {
		fieldId: "product",
		name: "商品",
		summary: undefined,
		image: undefined,
		disclosure: undefined,
		links: [
			{
				label: "Amazonで見る",
				url: "https://www.amazon.co.jp/example",
				type: "affiliate",
			},
			{
				label: "公式サイト",
				url: "https://example.com",
				type: "official",
			},
		],
	});
});

test("slugが空の記事は公開一覧へ渡さない", () => {
	assert.equal(
		normalizeMicroCMSArticle({
			id: "no-slug",
			createdAt: "2026-09-09T00:00:00.000Z",
			updatedAt: "2026-09-09T00:00:00.000Z",
			title: "slugなし",
		}),
		null,
	);
});

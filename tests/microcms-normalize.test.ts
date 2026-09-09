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
			{
				fieldId: "linkCard",
				url: "https://example.com/article",
				title: "参考記事",
			},
			{
				fieldId: "imagePanel",
				image: { url: "https://images.example.com/sample.jpg" },
				style: "browser",
			},
			{
				fieldId: "columns",
				leftTitle: "メリット",
				leftBody: "<p>軽い</p>",
				rightTitle: "注意点",
				rightBody: "<p>価格</p>",
			},
			{
				fieldId: "tabs",
				label1: "iPhone",
				body1: "<p>iOS版</p>",
				label2: "Android",
				body2: "<p>Android版</p>",
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
	assert.deepEqual(article.blocks[4], {
		fieldId: "linkCard",
		url: "https://example.com/article",
		title: "参考記事",
		description: undefined,
		image: undefined,
	});
	assert.deepEqual(article.blocks[5], {
		fieldId: "imagePanel",
		image: { url: "https://images.example.com/sample.jpg" },
		alt: undefined,
		caption: undefined,
		style: "browser",
	});
	assert.deepEqual(article.blocks[6], {
		fieldId: "columns",
		leftTitle: "メリット",
		leftBody: "<p>軽い</p>",
		rightTitle: "注意点",
		rightBody: "<p>価格</p>",
	});
	assert.deepEqual(article.blocks[7], {
		fieldId: "tabs",
		tabs: [
			{ label: "iPhone", body: "<p>iOS版</p>" },
			{ label: "Android", body: "<p>Android版</p>" },
		],
	});
});

test("本文ブロックがある場合は並び順を優先して旧本文を重ねない", () => {
	const article = normalizeMicroCMSArticle({
		id: "ordered",
		createdAt: "2026-09-09T00:00:00.000Z",
		updatedAt: "2026-09-09T01:00:00.000Z",
		title: "並べ替え記事",
		slug: "ordered-body",
		content: "<p>旧本文</p>",
		blocks: [
			{ fieldId: "richText", body: "<p>前半</p>" },
			{
				fieldId: "box",
				tone: "point",
				title: "要点",
				body: "<p>囲みの内容</p>",
			},
			{ fieldId: "richText", body: "<p>後半</p>" },
		],
	});

	assert.ok(article);
	assert.deepEqual(
		article.blocks.map((block) => block.fieldId),
		["richText", "box", "richText"],
	);
	assert.equal(article.blocks[0].fieldId, "richText");
	if (article.blocks[0].fieldId === "richText")
		assert.equal(article.blocks[0].body, "<p>前半</p>");
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

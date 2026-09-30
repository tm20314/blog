import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { prepareCMSHeadings } from "../src/utils/cms-headings";
import { annotateRichTextHeadings } from "../src/utils/article-headings";
import { articleDescription, blocksText, markdownText, socialImageUrl } from "../src/utils/article-metadata";
import { normalizeCategory } from "../src/config/categories";
import { readAnalyticsConsent, CONSENT_STORAGE_KEY } from "../src/scripts/consent-settings";
import { isTrustedArticleImage } from "../src/lib/remote-image-size.mjs";

test("公開・プレビューで同じ見出しIDを使い重複を避ける", () => {
	const blocks = [{ fieldId: "richText" as const, body: '<h1 id="old">はじめに</h1><h2>はじめに</h2><h3>はじめに-2</h3>' }, { fieldId: "richText" as const, body: "<h2>はじめに</h2>" }];
	const prepared = prepareCMSHeadings(blocks);
	const doc = new JSDOM(`<main>${[...prepared.htmlByBlock.values()].map((html) => `<div class="structured-article__rich-text">${html}</div>`).join("")}</main>`).window.document;
	assert.deepEqual(annotateRichTextHeadings(doc.querySelector("main")!), prepared.headings);
	assert.equal(new Set(prepared.headings.map((heading) => heading.slug)).size, 4);
	assert.doesNotMatch([...prepared.htmlByBlock.values()].join(""), /id="old"/u);
});
test("メタ説明には記事本文を使いコード・ブロック識別子を含めない", () => {
	const text = markdownText("# 記事\n\n本文の説明です。\n\n```js\nconst secret = 123;\n```\n");
	assert.equal(articleDescription(text, "記事"), "本文の説明です。");
	assert.equal(articleDescription("本文", "記事", "手動説明"), "手動説明");
	assert.equal(articleDescription("あ".repeat(200), "記事").length, 160);
	assert.equal(blocksText([{ fieldId: "richText", body: "<p>本文です。</p>" }]), "本文です。");
});
test("CMS共有画像をJPEG寸法で最適化し他のホストは書き換えない", () => {
	const url = new URL(socialImageUrl("https://images.microcms-assets.io/assets/photo.jpg"));
	assert.equal(url.searchParams.get("w"), "1200"); assert.equal(url.searchParams.get("fm"), "jpg");
	assert.equal(socialImageUrl("https://example.com/image.jpg"), "https://example.com/image.jpg");
});
test("画像の取得は既知のCDNだけ、内部アドレス・偽装ホストを拒否", () => {
	for (const url of ["http://127.0.0.1/a", "https://localhost/a", "https://images.microcms-assets.io.evil.example/a", "https://user@images.microcms-assets.io/a", "https://images.microcms-assets.io:444/a", "https://storage.googleapis.com/other-bucket/a"]) assert.equal(isTrustedArticleImage(url), false);
	assert.equal(isTrustedArticleImage("https://images.microcms-assets.io/assets/a.png"), true);
});
test("複合カテゴリは本文を変えずiOSに統一する", () => {
	assert.equal(normalizeCategory("iOS,Swift"), "iOS"); assert.equal(normalizeCategory("Swift"), "iOS"); assert.equal(normalizeCategory("Flutter"), "Flutter");
});
test("解析同意は型・期限を確認し保存不能時は拒否を維持する", () => {
	const read = (value: string | null) => readAnalyticsConsent({ getItem: (key) => { assert.equal(key, CONSENT_STORAGE_KEY); return value; } }, 100);
	assert.equal(read(null), null); assert.equal(read("oops"), null);
	assert.equal(read('{"allowed":true,"expires":200}'), true);
	assert.equal(read('{"allowed":false,"expires":200}'), false);
	assert.equal(read('{"allowed":true,"expires":99}'), null);
	assert.equal(readAnalyticsConsent({ getItem: () => { throw new Error("Blocked"); } }), null);
});

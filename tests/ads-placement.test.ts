import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";

const source = readFileSync(new URL("../src/components/integrations/AdSlot.astro", import.meta.url), "utf8");
const script = source.match(/<script is:inline>([\s\S]*?)<\/script>/u)![1];
function render(body: string) {
	return new JSDOM(`<div class="editorial-prose">${body}</div><aside class="ad-placement" data-after-paragraph="4" data-min-paragraphs="8"><ins class="adsbygoogle"></ins><script>${script}</script></aside>`, { runScripts: "dangerously" });
}
test("短文の途中広告は削除し、長文は本文の35%以上・600字以後に置く", () => {
	const short = render("<p>短文</p>".repeat(4));
	assert.equal(short.window.document.querySelector(".ad-placement"), null); short.window.close();
	const long = render("<p>文章を読んでいます。</p>".repeat(3) + `<p>${"あ".repeat(250)}</p>`.repeat(10));
	const ad = long.window.document.querySelector(".ad-placement")!;
	assert.ok(ad);
	let chars = 0; for (let node = ad.previousElementSibling; node; node = node.previousElementSibling) chars += node.textContent?.length || 0;
	assert.ok(chars >= 600); assert.ok(chars >= (2500 + 3 * 10) * .35); long.window.close();
});
test("商品ボックス内に広告を挿入しない", () => {
	const dom = render(`<div class="editor-product">${`<p>${"あ".repeat(300)}</p>`.repeat(12)}</div>`);
	assert.equal(dom.window.document.querySelector(".ad-placement"), null); dom.window.close();
});

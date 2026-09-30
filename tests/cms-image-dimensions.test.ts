import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

test("CMSプレビューは画像寸法を保持し不正な属性を除去する", async () => {
	const dom = new JSDOM("<body></body>", { url: "https://tumolog.com/preview/" });
	const keys = ["window", "document", "DOMParser", "HTMLAnchorElement", "HTMLImageElement", "HTMLTableCellElement"] as const;
	const previous = new Map(keys.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
	for (const key of keys) Object.defineProperty(globalThis, key, { configurable: true, value: dom.window[key] });
	try {
		const { sanitizeRichText, renderBlock } = await import("../src/scripts/microcms-preview");
		const html = sanitizeRichText('<img src="https://images.microcms-assets.io/a.jpg" width="1200" height="630" onerror="bad()"><img src="/x.jpg" width="-1" height="Infinity">');
		const container = dom.window.document.createElement("div"); container.innerHTML = html;
		assert.equal(container.querySelector("img")!.width, 1200);
		assert.equal(container.querySelector("img")!.height, 630);
		assert.doesNotMatch(html, /onerror|Infinity|-1/u);
		const block = renderBlock({ fieldId: "imagePanel", image: { url: "/photo.jpg", width: 800, height: 600 } });
		assert.equal(block!.querySelector("img")!.width, 800);
		assert.equal(block!.querySelector("img")!.height, 600);
	} finally {
		dom.window.close();
		for (const key of keys) { const value = previous.get(key); if (value) Object.defineProperty(globalThis, key, value); else Reflect.deleteProperty(globalThis, key); }
	}
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { JSDOM } from "jsdom";

test("拡張フィールドは正しい親だけを受け入れ、開いた時にはデータを送信しない", async () => {
	const html = readFileSync(new URL("../src/pages/editor.astro", import.meta.url), "utf8").replace(/^---[\s\S]*?---/u, "");
	const dom = new JSDOM(html, { url: "https://tumolog.com/editor/", pretendToBeVisual: true });
	const globals = ["window", "document", "navigator", "Node", "Element", "HTMLElement", "HTMLAnchorElement", "HTMLImageElement", "HTMLTableCellElement", "MutationObserver", "DOMParser", "FormData", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame"];
	const originals = new Map(globals.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
	for (const key of globals) Object.defineProperty(globalThis, key, { configurable: true, value: dom.window[key] });
	const messages: Array<{ action: string; message: { data?: unknown } }> = [];
	const parent = { postMessage: (message: typeof messages[number], origin: string) => { assert.equal(origin, "https://tumolog.microcms.io"); messages.push(message); } };
	Object.defineProperty(dom.window, "parent", { value: parent });
	try {
		const { initLiveEditor } = await import("../src/scripts/live-editor");
		initLiveEditor();
		const initial = { version: 1, enabled: false, blocks: [
			{ fieldId: "richText", body: '<p><span class="cms-box-note">補足</span></p>' },
			{ fieldId: "product", name: "テスト製品", amazonUrl: "https://amzn.to/test" },
			{ fieldId: "richText", body: "<p>続き</p>" },
		] };
		const load = (origin: string, source = parent) => dom.window.dispatchEvent(new dom.window.MessageEvent("message", {
			origin, source, data: { id: "field", action: "MICROCMS_GET_DEFAULT_DATA", message: { data: initial } },
		}));
		const checkbox = dom.window.document.querySelector<HTMLInputElement>("[data-enabled]")!;
		load("https://malicious.example");
		assert.equal(checkbox.disabled, true);
		load("https://tumolog.microcms.io", {} as typeof parent);
		assert.equal(checkbox.disabled, true);
		load("https://tumolog.microcms.io");
		assert.equal(checkbox.disabled, false);
		assert.equal(messages.filter((message) => message.action === "MICROCMS_POST_DATA").length, 0);
		const preview = dom.window.document.querySelector("[data-live-preview]")!;
		assert.match(preview.textContent!, /補足.*テスト製品.*続き/su);
		assert.ok(preview.querySelector(".cms-box-note"));
		checkbox.click();
		const saved = messages.find((message) => message.action === "MICROCMS_POST_DATA")!;
		assert.deepEqual(saved.message.data, { ...initial, enabled: true });
		// A late initialization message must not overwrite the current edit.
		load("https://tumolog.microcms.io");
		assert.equal(checkbox.checked, true);
	} finally {
		dom.window.close();
		for (const [key, original] of originals) {
			if (original) Object.defineProperty(globalThis, key, original);
			else Reflect.deleteProperty(globalThis, key);
		}
	}
});

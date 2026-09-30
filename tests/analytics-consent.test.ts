import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { initConsentSettings } from "../src/scripts/consent-settings";

test("GAは許可前に読み込まず、選択を保存し、撤回時に無効化する（広告同意とは別）", () => {
	const source = readFileSync(new URL("../src/components/integrations/GoogleServices.astro", import.meta.url), "utf8");
	const defaults = source.match(/<script is:inline>([\s\S]*?)<\/script>/u)![1];
	const analytics = source.match(/<script is:inline define:vars=\{\{ gaMeasurementId \}\}>([\s\S]*?)<\/script>/u)![1];
	const dom = new JSDOM(`<head><script>const gaMeasurementId="G-TESTONLY";${defaults}${analytics}</script></head><body><details data-consent-settings><summary>設定</summary><button data-analytics-allow>許可</button><button data-analytics-deny>拒否</button><p data-consent-status></p></details></body>`, { url: "https://tumolog.com", runScripts: "dangerously" });
	const keys = ["window", "document", "localStorage"] as const;
	const original = new Map(keys.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
	for (const key of keys) Object.defineProperty(globalThis, key, { configurable: true, value: dom.window[key] });
	try {
		initConsentSettings();
		const doc = dom.window.document;
		assert.equal(doc.querySelector('script[src*="googletagmanager"]'), null);
		doc.querySelector<HTMLButtonElement>("[data-analytics-allow]")!.click();
		assert.equal(doc.querySelectorAll('script[src*="googletagmanager"]').length, 1);
		assert.equal(JSON.parse(dom.window.localStorage.getItem("tumolog.analytics-consent.v1")!).allowed, true);
		doc.querySelector<HTMLButtonElement>("[data-analytics-deny]")!.click();
		assert.equal(dom.window["ga-disable-G-TESTONLY" as keyof typeof dom.window], true);
		assert.equal(JSON.parse(dom.window.localStorage.getItem("tumolog.analytics-consent.v1")!).allowed, false);
		for (const command of dom.window.dataLayer as IArguments[]) if (command[0] === "consent" && command[1] === "update") assert.equal(command[2].ad_storage, undefined);
	} finally {
		dom.window.close();
		for (const key of keys) { const descriptor = original.get(key); if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key); }
	}
});

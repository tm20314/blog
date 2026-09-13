import assert from "node:assert/strict";
import test from "node:test";
import { serializeJsonLd } from "../src/utils/structured-data";

test("CMS text cannot close a JSON-LD script but retains its original value", () => {
	const value = {
		headline: '</script><script>alert("x")</script>',
		description: "つもログ & ガジェット",
	};
	const serialized = serializeJsonLd(value);
	assert.ok(!serialized.includes("<"));
	assert.deepEqual(JSON.parse(serialized), value);
});

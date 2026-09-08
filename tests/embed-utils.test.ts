import assert from "node:assert/strict";
import test from "node:test";
import { getSafeEmbed } from "../src/utils/embed-utils";

test("対応するSNS・動画URLを安全な埋め込みURLへ変換する", () => {
	assert.equal(
		getSafeEmbed("https://youtu.be/dQw4w9WgXcQ")?.src,
		"https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?playsinline=1",
	);
	assert.equal(
		getSafeEmbed("https://x.com/example/status/123456789")?.provider,
		"x",
	);
	assert.equal(
		getSafeEmbed("https://www.instagram.com/p/ABC_def/")?.provider,
		"instagram",
	);
	assert.equal(
		getSafeEmbed("https://www.tiktok.com/@example/video/123456789")?.provider,
		"tiktok",
	);
	assert.equal(getSafeEmbed("https://vimeo.com/123456")?.provider, "vimeo");
});

test("未対応URLと危険なURLは埋め込まない", () => {
	assert.equal(getSafeEmbed("javascript:alert(1)"), null);
	assert.equal(getSafeEmbed("https://example.com/video/123"), null);
	assert.equal(getSafeEmbed("not-a-url"), null);
});

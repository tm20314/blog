import assert from "node:assert/strict";
import test from "node:test";
import { rehypeSmartEmbeds } from "../src/plugins/rehype-smart-embeds.mjs";

const text = (value) => ({ type: "text", value });
const element = (tagName, properties = {}, children = []) => ({
	type: "element",
	tagName,
	properties,
	children,
});
const linkedUrl = (href, label = href) => element("a", { href }, [text(label)]);
const paragraph = (...children) => element("p", {}, children);

function transform(children, options) {
	const tree = { type: "root", children };
	rehypeSmartEmbeds(options)(tree);
	return tree;
}

test("supported media URLs become lazy embeds", () => {
	const urls = [
		"https://www.youtube.com/watch?v=fBNEt6EOOHU#t=8m00s",
		"https://x.com/gadgelogger/status/1633503309171687424",
		"https://www.instagram.com/reel/ABC_123/",
		"https://www.tiktok.com/@creator/video/7460123456789012345",
		"https://vimeo.com/76979871",
	];
	const tree = transform(urls.map((url) => paragraph(linkedUrl(url))));

	assert.deepEqual(
		tree.children.map((node) => node.properties.className[1]),
		[
			"media-embed--youtube",
			"media-embed--x",
			"media-embed--instagram",
			"media-embed--tiktok",
			"media-embed--vimeo",
		],
	);
	const youtubeFrame = tree.children[0].children[1].children[0];
	assert.equal(youtubeFrame.properties.loading, "lazy");
	assert.match(youtubeFrame.properties.src, /start=480/u);
});

test("Amazon cards add only a valid configured associate tag", () => {
	const url = "https://www.amazon.co.jp/SwiftUI-入門/dp/B0CLXV1YBG/ref=sample";
	const tree = transform([paragraph(linkedUrl(url))], {
		amazonAssociateTag: "example-22",
	});
	const card = tree.children[0];
	const link = card.children[0];

	assert.deepEqual(card.properties.className, [
		"smart-link-card",
		"smart-link-card--amazon",
	]);
	assert.equal(
		new URL(link.properties.href).searchParams.get("tag"),
		"example-22",
	);
	assert.match(link.properties.rel, /sponsored/u);
	assert.match(link.children[1].children[1].children[0].value, /SwiftUI 入門/u);
});

test("a URL on its own source line splits safely from images and prose", () => {
	const url = "https://example.com/article";
	const tree = transform([
		paragraph(
			element("img", { src: "/cover.png", alt: "cover" }),
			text("\n"),
			linkedUrl(url),
			text("\n説明文です。"),
		),
	]);

	assert.deepEqual(
		tree.children.map((node) => node.tagName),
		["p", "aside", "p"],
	);
	assert.equal(tree.children[0].children[0].tagName, "img");
	assert.equal(tree.children[2].children[0].value, "説明文です。");
});

test("inline links and linked images remain regular paragraph content", () => {
	const inline = paragraph(
		text("公式サイトは"),
		linkedUrl("https://example.com/", "こちら"),
		text("です。"),
	);
	const linkedImage = paragraph(
		element("a", { href: "https://example.com/" }, [
			element("img", { src: "/cover.png", alt: "cover" }),
		]),
	);
	const tree = transform([inline, linkedImage]);

	assert.equal(tree.children[0], inline);
	assert.equal(tree.children[1], linkedImage);
});

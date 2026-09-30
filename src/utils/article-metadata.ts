import { Parser } from "htmlparser2";
import MarkdownIt from "markdown-it";
import type { EditorialBlock } from "../types/editorial-blocks";

const markdown = new MarkdownIt({ html: true });
export function htmlText(html: string) {
	let text = "";
	let suppressed = 0;
	const parser = new Parser(
		{
			onopentag(name) {
				if (["script", "style", "pre", "code"].includes(name)) suppressed++;
			},
			ontext(value) {
				if (!suppressed) text += value;
			},
			onclosetag(name) {
				if (["script", "style", "pre", "code"].includes(name))
					suppressed = Math.max(0, suppressed - 1);
				if (["p", "div", "h1", "h2", "h3", "h4", "li", "br"].includes(name))
					text += " ";
			},
		},
		{ decodeEntities: true },
	);
	parser.write(html);
	parser.end();
	return text.replace(/\s+/gu, " ").trim();
}
export function markdownText(source: string) {
	return htmlText(markdown.render(source.replace(/^```[\s\S]*?^```/gmu, "")));
}
export function blocksText(blocks: EditorialBlock[]) {
	const textFields = new Set([
		"title",
		"body",
		"question",
		"answer",
		"label",
		"caption",
		"text",
		"pros",
		"cons",
		"cells",
		"headers",
	]);
	const collect = (value: unknown, key = ""): string => {
		if (typeof value === "string")
			return textFields.has(key) ? htmlText(value) : "";
		if (Array.isArray(value))
			return value
				.map((item) => collect(item, key))
				.filter(Boolean)
				.join(" ");
		if (value && typeof value === "object")
			return Object.entries(value)
				.map(([name, item]) => collect(item, name))
				.filter(Boolean)
				.join(" ");
		return "";
	};
	return collect(blocks);
}
export function articleDescription(text: string, title: string, explicit = "") {
	const clean = (explicit.trim() || text).replace(/\s+/gu, " ").trim();
	const withoutTitle = clean.startsWith(title)
		? clean.slice(title.length).trim()
		: clean;
	const excerpt =
		withoutTitle || clean || `${title}について書いた、つもログの記事です。`;
	return excerpt.length > 160 ? `${excerpt.slice(0, 159).trimEnd()}…` : excerpt;
}
export function socialImageUrl(value: string) {
	try {
		const image = new URL(value);
		if (image.hostname === "images.microcms-assets.io") {
			image.searchParams.set("w", "1200");
			image.searchParams.set("h", "630");
			image.searchParams.set("fit", "crop");
			image.searchParams.set("fm", "jpg");
			image.searchParams.set("q", "80");
		}
		return image.href;
	} catch {
		return value;
	}
}

import sanitizeHtml from "sanitize-html";
import type { EditorialBlock } from "../types/editorial-blocks";
import { type ArticleHeading, headingSlugger } from "./article-headings";
import { htmlText } from "./article-metadata";

export function prepareCMSHeadings(blocks: EditorialBlock[]) {
	const headings: ArticleHeading[] = [];
	const slug = headingSlugger();
	const htmlByBlock = new Map<number, string>();
	blocks.forEach((block, index) => {
		if (block.fieldId !== "richText") return;
		// Strip existing IDs before assigning ours, including adversarial ones.
		const safe = sanitizeHtml(block.body, {
			allowedTags: [
				...sanitizeHtml.defaults.allowedTags,
				"img",
				"figure",
				"figcaption",
			],
			allowedAttributes: false,
			transformTags: {
				"*": (tagName, attribs) => {
					const { id, ...rest } = attribs;
					return { tagName: tagName === "h1" ? "h2" : tagName, attribs: rest };
				},
			},
		});
		htmlByBlock.set(
			index,
			safe.replace(
				/<(h[2-4])([^>]*)>([\s\S]*?)<\/\1>/giu,
				(_match, tag: string, attrs: string, body: string) => {
					const text = htmlText(body) || "見出し";
					const id = slug(text);
					headings.push({ depth: Number(tag.slice(1)), slug: id, text });
					return `<${tag}${attrs} id="${id}">${body}</${tag}>`;
				},
			),
		);
	});
	return { headings, htmlByBlock };
}

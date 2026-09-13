import { parseDocument } from "htmlparser2";

export type CMSRawBlock = Record<string, unknown>;
export type LiveBody = {
	version: 1;
	enabled: boolean;
	blocks: CMSRawBlock[];
};

export function isLiveBody(value: unknown): value is LiveBody {
	if (!value || typeof value !== "object") return false;
	const body = value as Partial<LiveBody>;
	return (
		body.version === 1 &&
		typeof body.enabled === "boolean" &&
		Array.isArray(body.blocks) &&
		body.blocks.every(
			(block) =>
				block &&
				typeof block === "object" &&
				(block.fieldId === "product" ||
					(block.fieldId === "richText" && typeof block.body === "string")),
		)
	);
}

/** One ordering rule for the build, saved-draft preview, and live editor. */
export function selectCMSBody(article: {
	content?: string;
	blocks?: CMSRawBlock[];
	liveBody?: unknown;
}): CMSRawBlock[] {
	if (isLiveBody(article.liveBody) && article.liveBody.enabled) {
		return article.liveBody.blocks;
	}
	const blocks = (Array.isArray(article.blocks) ? article.blocks : []).filter(
		(block) => block && typeof block === "object",
	);
	if (
		blocks.some(
			(block) =>
				block.fieldId === "richText" &&
				typeof block.body === "string" &&
				block.body.trim(),
		)
	)
		return blocks;
	if (!article.content?.trim()) return blocks;

	// Only a standalone, unformatted paragraph is a placement instruction.
	// Unknown references remain visible; never silently remove the author's text.
	const products = blocks.filter((block) => block.fieldId === "product");
	const placed = new Set<CMSRawBlock>();
	const result: CMSRawBlock[] = [];
	let offset = 0;
	const document = parseDocument(article.content, {
		withStartIndices: true,
		withEndIndices: true,
	});
	for (const node of document.children) {
		if (node.type !== "tag" || node.name !== "p" || node.children.length !== 1)
			continue;
		const child = node.children[0];
		if (
			child.type !== "text" ||
			node.startIndex == null ||
			node.endIndex == null
		)
			continue;
		const match = /^\s*\[\[product:([1-9]\d*)\]\]\s*$/u.exec(child.data);
		if (!match) continue;
		const product = products[Number(match[1]) - 1];
		if (!product) continue;
		const before = article.content.slice(offset, node.startIndex);
		if (before.trim()) result.push({ fieldId: "richText", body: before });
		result.push(product);
		placed.add(product);
		offset = node.endIndex + 1;
	}
	const rest = article.content.slice(offset);
	if (rest.trim()) result.push({ fieldId: "richText", body: rest });
	return [...result, ...blocks.filter((block) => !placed.has(block))];
}

import type {
	EditorialBlock,
	MicroCMSArticle,
	MicroCMSListResponse,
	NormalizedMicroCMSArticle,
} from "@/types/editorial-blocks";

const env = import.meta.env ?? {};
const serviceDomain = env.MICROCMS_SERVICE_DOMAIN?.trim();
const apiKey = env.MICROCMS_API_KEY?.trim();
const apiEndpoint = env.MICROCMS_API_ENDPOINT?.trim() || "blogs";

export const isMicroCMSConfigured = Boolean(serviceDomain && apiKey);

function apiUrl(path = "", queries?: URLSearchParams) {
	if (!serviceDomain || !/^[a-z0-9-]+$/u.test(serviceDomain)) {
		throw new Error("MICROCMS_SERVICE_DOMAIN is not configured correctly.");
	}
	if (!/^[a-zA-Z0-9_-]+$/u.test(apiEndpoint)) {
		throw new Error("MICROCMS_API_ENDPOINT is not configured correctly.");
	}

	const suffix = path ? `/${encodeURIComponent(path)}` : "";
	const query = queries?.toString();
	return `https://${serviceDomain}.microcms.io/api/v1/${apiEndpoint}${suffix}${query ? `?${query}` : ""}`;
}

async function request<T>(url: string): Promise<T> {
	if (!apiKey) {
		throw new Error("MICROCMS_API_KEY is not configured.");
	}

	const response = await fetch(url, {
		headers: { "X-MICROCMS-API-KEY": apiKey },
	});
	if (!response.ok) {
		throw new Error(`microCMS request failed (${response.status}).`);
	}
	return response.json() as Promise<T>;
}

export async function getMicroCMSArticles(
	options: {
		limit?: number;
		offset?: number;
		orders?: string;
		filters?: string;
	} = {},
): Promise<MicroCMSListResponse<MicroCMSArticle>> {
	const queries = new URLSearchParams();
	for (const [key, value] of Object.entries(options)) {
		if (value !== undefined) queries.set(key, String(value));
	}
	return request(apiUrl("", queries));
}

export async function getAllMicroCMSArticles() {
	const firstPage = await getMicroCMSArticles({
		limit: 100,
		orders: "-publishedAt",
	});
	const contents = [...firstPage.contents];

	for (
		let offset = contents.length;
		offset < firstPage.totalCount;
		offset += 100
	) {
		const page = await getMicroCMSArticles({
			limit: 100,
			offset,
			orders: "-publishedAt",
		});
		contents.push(...page.contents);
	}

	return contents;
}

export async function getMicroCMSArticle(contentId: string) {
	return request<MicroCMSArticle>(apiUrl(contentId));
}

const asString = (value: unknown) =>
	typeof value === "string" ? value.trim() : "";

const splitLines = (value: unknown) =>
	asString(value)
		.split(/\r?\n/u)
		.map((item) => item.trim())
		.filter(Boolean);

const splitCells = (value: string) =>
	value
		.split(/[|｜]/u)
		.map((item) => item.trim())
		.filter(Boolean);

const asImage = (value: unknown) => {
	if (!value || typeof value !== "object") return undefined;
	const image = value as Record<string, unknown>;
	const url = asString(image.url);
	if (!url) return undefined;
	return {
		url,
		...(typeof image.width === "number" ? { width: image.width } : {}),
		...(typeof image.height === "number" ? { height: image.height } : {}),
		...(asString(image.alt) ? { alt: asString(image.alt) } : {}),
	};
};

function normalizeBlock(block: Record<string, unknown>): EditorialBlock | null {
	const fieldId = asString(block.fieldId);

	switch (fieldId) {
		case "richText":
			return { fieldId, body: asString(block.body) };
		case "box": {
			const tone = asString(block.tone);
			return {
				fieldId,
				tone: ["note", "point", "check", "warning"].includes(tone)
					? (tone as "note" | "point" | "check" | "warning")
					: "note",
				title: asString(block.title) || undefined,
				body: asString(block.body),
			};
		}
		case "button": {
			const variant = asString(block.variant);
			return {
				fieldId,
				label: asString(block.label),
				url: asString(block.url),
				variant: variant === "secondary" ? "secondary" : "primary",
			};
		}
		case "speech":
			return {
				fieldId,
				name: asString(block.name) || undefined,
				avatar: asImage(block.avatar),
				side: asString(block.side) === "right" ? "right" : "left",
				body: asString(block.body),
			};
		case "faq":
			return {
				fieldId,
				question: asString(block.question),
				answer: asString(block.answer),
			};
		case "accordion":
			return {
				fieldId,
				title: asString(block.title),
				body: asString(block.body),
			};
		case "stepList":
			return {
				fieldId,
				title: asString(block.title) || undefined,
				items: splitLines(block.itemsText).map((line) => {
					const [title, ...body] = splitCells(line);
					return { title, body: body.join("｜") };
				}),
			};
		case "prosCons":
			return {
				fieldId,
				title: asString(block.title) || undefined,
				pros: splitLines(block.prosText),
				cons: splitLines(block.consText),
			};
		case "comparison":
			return {
				fieldId,
				caption: asString(block.caption) || undefined,
				headers: splitCells(asString(block.headersText)),
				rows: splitLines(block.rowsText).map(splitCells),
			};
		case "product": {
			const links = [
				{
					label: "Amazonで見る",
					url: asString(block.amazonUrl),
					type: "affiliate" as const,
				},
				{
					label: "楽天で見る",
					url: asString(block.rakutenUrl),
					type: "affiliate" as const,
				},
				{
					label: "公式サイト",
					url: asString(block.officialUrl),
					type: "official" as const,
				},
			].filter((link) => link.url);
			return {
				fieldId,
				name: asString(block.name),
				summary: asString(block.summary) || undefined,
				image: asImage(block.image),
				disclosure: asString(block.disclosure) || undefined,
				links,
			};
		}
		case "linkCard":
			return {
				fieldId,
				url: asString(block.url),
				title: asString(block.title) || undefined,
				description: asString(block.description) || undefined,
				image: asImage(block.image),
			};
		case "embed":
			return {
				fieldId,
				url: asString(block.url),
				caption: asString(block.caption) || undefined,
			};
		case "imagePanel": {
			const style = asString(block.style);
			return {
				fieldId,
				image: asImage(block.image),
				alt: asString(block.alt) || undefined,
				caption: asString(block.caption) || undefined,
				style: ["rounded", "shadow", "browser"].includes(style)
					? (style as "rounded" | "shadow" | "browser")
					: "plain",
			};
		}
		case "columns":
			return {
				fieldId,
				leftTitle: asString(block.leftTitle) || undefined,
				leftBody: asString(block.leftBody),
				rightTitle: asString(block.rightTitle) || undefined,
				rightBody: asString(block.rightBody),
			};
		case "tabs": {
			const tabs = [1, 2, 3].flatMap((index) => {
				const label = asString(block[`label${index}`]);
				const body = asString(block[`body${index}`]);
				return label && body ? [{ label, body }] : [];
			});
			return { fieldId, tabs };
		}
		default:
			return null;
	}
}

export function normalizeMicroCMSArticle(
	article: MicroCMSArticle,
): NormalizedMicroCMSArticle | null {
	const slug = asString(article.slug).replace(/^\/+|\/+$/gu, "");
	if (!slug) return null;

	const blocks = (article.blocks ?? [])
		.map(normalizeBlock)
		.filter((block): block is EditorialBlock => block !== null);
	const content = asString(article.content);
	if (content) blocks.unshift({ fieldId: "richText", body: content });

	return {
		...article,
		slug,
		category:
			typeof article.category === "string"
				? article.category.trim()
				: article.category?.name?.trim() || "",
		blocks,
	};
}

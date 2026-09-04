const ZERO_WIDTH_CHARACTERS = /[\u200B-\u200D\u2060\uFEFF]/gu;
const TRAILING_PUNCTUATION = /[、。！？）］｝〉》」』】]+$/u;

const AMAZON_HOST_PATTERN =
	/(^|\.)amazon\.(?:co\.jp|com|co\.uk|de|fr|it|es|ca|com\.au|in|com\.br|com\.mx|nl|se|pl|sg|ae|sa|com\.tr|be)$/iu;
const AMAZON_SHORT_HOSTS = new Set(["amzn.to", "amzn.asia"]);

function text(value) {
	return { type: "text", value };
}

function element(tagName, properties = {}, children = []) {
	return { type: "element", tagName, properties, children };
}

function getText(node) {
	if (node?.type === "text") return node.value;
	if (!Array.isArray(node?.children)) return "";
	return node.children.map(getText).join("");
}

function normalizeUrl(value) {
	if (typeof value !== "string") return null;

	const cleaned = value
		.replace(ZERO_WIDTH_CHARACTERS, "")
		.trim()
		.replace(TRAILING_PUNCTUATION, "");

	try {
		const url = new URL(cleaned);
		return url.protocol === "http:" || url.protocol === "https:" ? url : null;
	} catch {
		return null;
	}
}

function isSameUrlLabel(label, url) {
	return normalizeUrl(label)?.href === url.href;
}

function extractStandaloneLink(node) {
	const children = node.children.filter(
		(child) => child.type !== "text" || child.value.trim() !== "",
	);

	if (children.length !== 1) return null;

	const child = children[0];
	if (child.type === "element" && child.tagName === "a") {
		const url = normalizeUrl(child.properties?.href);
		const label = getText(child).trim();
		if (!url || !label) return null;
		return { url, label };
	}

	if (child.type === "text") {
		const value = child.value.replace(ZERO_WIDTH_CHARACTERS, "").trim();
		if (!/^https?:\/\/\S+$/u.test(value)) return null;
		const url = normalizeUrl(value);
		if (!url) return null;
		return { url, label: url.href };
	}

	return null;
}

function normalizedHost(url) {
	return url.hostname.toLowerCase().replace(/^www\./u, "");
}

function isAmazonUrl(url) {
	const host = normalizedHost(url);
	return AMAZON_SHORT_HOSTS.has(host) || AMAZON_HOST_PATTERN.test(host);
}

function getAmazonAsin(url) {
	return (
		url.pathname
			.match(
				/\/(?:dp|gp\/product|gp\/aw\/d|product)\/([A-Z0-9]{10})(?:[/?]|$)/iu,
			)?.[1]
			?.toUpperCase() ?? null
	);
}

function decodePathSegment(value) {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}

function getAmazonTitle(url, label) {
	if (label && !isSameUrlLabel(label, url)) return label;

	const parts = url.pathname.split("/").filter(Boolean);
	const productMarker = parts.findIndex((part) => part.toLowerCase() === "dp");
	if (productMarker > 0) {
		const title = decodePathSegment(parts[productMarker - 1])
			.replace(/[-_]+/gu, " ")
			.trim();
		if (title && !/^gp$/iu.test(title)) return title;
	}

	return "Amazonの商品を見る";
}

function getDisplayPath(url) {
	const decodedPath = decodePathSegment(url.pathname)
		.replace(/\/$/u, "")
		.replace(/\s+/gu, " ");
	const value = `${decodedPath || "/"}${url.search ? "…" : ""}`;
	return value.length > 72 ? `${value.slice(0, 69)}…` : value;
}

function externalLinkProperties(href, sponsored = false) {
	return {
		href,
		target: "_blank",
		rel: sponsored ? "noopener noreferrer sponsored" : "noopener noreferrer",
		className: ["no-styling"],
	};
}

function createAmazonCard(url, label, associateTag) {
	const host = normalizedHost(url);
	const title = getAmazonTitle(url, label);
	const isShortLink = AMAZON_SHORT_HOSTS.has(host);
	const existingTag = url.searchParams.get("tag")?.trim();
	const canApplyTag =
		associateTag && !isShortLink && AMAZON_HOST_PATTERN.test(host);
	if (!existingTag && canApplyTag) url.searchParams.set("tag", associateTag);

	const isAffiliate = Boolean(existingTag || canApplyTag);
	const asin = getAmazonAsin(url);

	return element(
		"aside",
		{
			className: ["smart-link-card", "smart-link-card--amazon"],
			dataPagefindIgnore: true,
		},
		[
			element(
				"a",
				{
					...externalLinkProperties(url.href, isAffiliate),
					className: ["no-styling", "smart-link-card__link"],
					ariaLabel: `${title}をAmazonで見る（新しいタブで開きます）`,
				},
				[
					element(
						"span",
						{ className: ["smart-link-card__mark"], ariaHidden: "true" },
						[text("a")],
					),
					element("span", { className: ["smart-link-card__body"] }, [
						element("span", { className: ["smart-link-card__eyebrow"] }, [
							text(isAffiliate ? "広告 · AMAZON ASSOCIATES" : "AMAZON"),
						]),
						element("strong", { className: ["smart-link-card__title"] }, [
							text(title),
						]),
						element("span", { className: ["smart-link-card__meta"] }, [
							text(asin ? `ASIN ${asin}` : host),
						]),
					]),
					element("span", { className: ["smart-link-card__action"] }, [
						text("Amazonで見る ↗"),
					]),
				],
			),
		],
	);
}

function createGenericCard(url, label) {
	const host = normalizedHost(url);
	const customLabel = label && !isSameUrlLabel(label, url);

	return element(
		"aside",
		{ className: ["smart-link-card"], dataPagefindIgnore: true },
		[
			element(
				"a",
				{
					...externalLinkProperties(url.href),
					className: ["no-styling", "smart-link-card__link"],
					ariaLabel: `${customLabel ? label : host}を新しいタブで開きます`,
				},
				[
					element(
						"span",
						{ className: ["smart-link-card__mark"], ariaHidden: "true" },
						[text(host.charAt(0).toUpperCase())],
					),
					element("span", { className: ["smart-link-card__body"] }, [
						element("span", { className: ["smart-link-card__eyebrow"] }, [
							text("EXTERNAL LINK"),
						]),
						element("strong", { className: ["smart-link-card__title"] }, [
							text(customLabel ? label : host),
						]),
						element("span", { className: ["smart-link-card__meta"] }, [
							text(customLabel ? host : getDisplayPath(url)),
						]),
					]),
					element("span", { className: ["smart-link-card__action"] }, [
						text("開く ↗"),
					]),
				],
			),
		],
	);
}

function parseYouTubeTime(value) {
	if (!value) return 0;
	if (/^\d+$/u.test(value)) return Number(value);

	const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/iu);
	if (!match) return 0;
	return (
		Number(match[1] ?? 0) * 3600 +
		Number(match[2] ?? 0) * 60 +
		Number(match[3] ?? 0)
	);
}

function getYouTubeEmbed(url) {
	const host = normalizedHost(url);
	let id = null;

	if (host === "youtu.be") {
		id = url.pathname.split("/").filter(Boolean)[0] ?? null;
	} else if (
		["youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(host)
	) {
		id = url.searchParams.get("v");
		if (!id) {
			const match = url.pathname.match(/^\/(?:shorts|embed|live)\/([^/?#]+)/u);
			id = match?.[1] ?? null;
		}
	}

	if (!id || !/^[A-Za-z0-9_-]{6,15}$/u.test(id)) return null;

	const hashParams = new URLSearchParams(url.hash.replace(/^#/u, ""));
	const start = parseYouTubeTime(
		url.searchParams.get("t") ??
			url.searchParams.get("start") ??
			hashParams.get("t"),
	);
	const embedUrl = new URL(`https://www.youtube-nocookie.com/embed/${id}`);
	embedUrl.searchParams.set("playsinline", "1");
	if (start > 0) embedUrl.searchParams.set("start", String(start));

	return {
		provider: "youtube",
		label: "YouTube",
		title: "YouTube 動画",
		src: embedUrl.href,
		kind: "video",
		allow:
			"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
		allowFullScreen: true,
	};
}

function getXEmbed(url) {
	const host = normalizedHost(url);
	if (!["x.com", "twitter.com", "mobile.twitter.com"].includes(host))
		return null;

	const match = url.pathname.match(/^\/([^/]+)\/status(?:es)?\/(\d+)/u);
	if (!match) return null;

	const embedUrl = new URL("https://platform.twitter.com/embed/Tweet.html");
	embedUrl.searchParams.set("id", match[2]);
	embedUrl.searchParams.set("dnt", "true");
	embedUrl.searchParams.set("theme", "light");

	return {
		provider: "x",
		label: "X",
		title: `X（@${match[1]}）の投稿`,
		src: embedUrl.href,
		kind: "social",
	};
}

function getInstagramEmbed(url) {
	const host = normalizedHost(url);
	if (!["instagram.com", "m.instagram.com"].includes(host)) return null;

	const match = url.pathname.match(/^\/(p|reel|tv)\/([A-Za-z0-9_-]+)/u);
	if (!match) return null;

	return {
		provider: "instagram",
		label: "Instagram",
		title: "Instagram の投稿",
		src: `https://www.instagram.com/${match[1]}/${match[2]}/embed/captioned/`,
		kind: "social",
	};
}

function getTikTokEmbed(url) {
	const host = normalizedHost(url);
	if (!["tiktok.com", "m.tiktok.com"].includes(host)) return null;

	const match = url.pathname.match(/\/video\/(\d+)/u);
	if (!match) return null;

	return {
		provider: "tiktok",
		label: "TikTok",
		title: "TikTok の投稿",
		src: `https://www.tiktok.com/player/v1/${match[1]}?autoplay=0&loop=0`,
		kind: "portrait",
		allow: "fullscreen; autoplay; encrypted-media; picture-in-picture",
		allowFullScreen: true,
	};
}

function getVimeoEmbed(url) {
	const host = normalizedHost(url);
	if (!["vimeo.com", "player.vimeo.com"].includes(host)) return null;

	const match = url.pathname.match(/\/(?:video\/)?(\d+)(?:\/([A-Za-z0-9]+))?/u);
	if (!match) return null;

	const embedUrl = new URL(`https://player.vimeo.com/video/${match[1]}`);
	if (match[2]) embedUrl.searchParams.set("h", match[2]);

	return {
		provider: "vimeo",
		label: "Vimeo",
		title: "Vimeo 動画",
		src: embedUrl.href,
		kind: "video",
		allow:
			"autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share",
		allowFullScreen: true,
	};
}

function getEmbed(url) {
	return (
		getYouTubeEmbed(url) ??
		getXEmbed(url) ??
		getInstagramEmbed(url) ??
		getTikTokEmbed(url) ??
		getVimeoEmbed(url)
	);
}

function createEmbed(embed, sourceUrl) {
	const iframeProperties = {
		className: ["media-embed__frame"],
		src: embed.src,
		title: embed.title,
		loading: "lazy",
		referrerPolicy: "strict-origin-when-cross-origin",
	};
	if (embed.allow) iframeProperties.allow = embed.allow;
	if (embed.allowFullScreen) iframeProperties.allowFullScreen = true;

	return element(
		"figure",
		{
			className: [
				"media-embed",
				`media-embed--${embed.provider}`,
				`media-embed--${embed.kind}`,
			],
			dataPagefindIgnore: true,
		},
		[
			element("figcaption", { className: ["media-embed__header"] }, [
				element("span", { className: ["media-embed__provider"] }, [
					text(embed.label),
				]),
				element(
					"a",
					{
						...externalLinkProperties(sourceUrl.href),
						className: ["no-styling", "media-embed__source"],
						ariaLabel: `${embed.title}を元のサイトで開きます`,
					},
					[text("元の投稿を開く ↗")],
				),
			]),
			element("div", { className: ["media-embed__viewport"] }, [
				element("iframe", iframeProperties, []),
			]),
		],
	);
}

function normalizeAssociateTag(value) {
	const tag = typeof value === "string" ? value.trim() : "";
	return /^[A-Za-z0-9_-]+-\d{2}$/u.test(tag) ? tag : "";
}

function splitParagraphLines(children) {
	const lines = [[]];

	for (const child of children) {
		if (child.type !== "text" || !child.value.includes("\n")) {
			lines.at(-1).push(child);
			continue;
		}

		const segments = child.value.split("\n");
		segments.forEach((segment, segmentIndex) => {
			if (segment) lines.at(-1).push(text(segment));
			if (segmentIndex < segments.length - 1) lines.push([]);
		});
	}

	return lines;
}

function lineHasContent(line) {
	return line.some(
		(child) => child.type !== "text" || child.value.trim() !== "",
	);
}

function paragraphFromLines(lines) {
	const meaningfulLines = [...lines];
	while (meaningfulLines.length && !lineHasContent(meaningfulLines[0]))
		meaningfulLines.shift();
	while (meaningfulLines.length && !lineHasContent(meaningfulLines.at(-1)))
		meaningfulLines.pop();
	if (!meaningfulLines.length) return null;

	const children = [];
	meaningfulLines.forEach((line, index) => {
		if (index > 0) children.push(text("\n"));
		children.push(...line);
	});

	return element("p", {}, children);
}

function cardOrEmbed(url, label, associateTag) {
	const embed = getEmbed(url);
	if (embed) return createEmbed(embed, url);
	return isAmazonUrl(url)
		? createAmazonCard(url, label, associateTag)
		: createGenericCard(url, label);
}

function transformParagraph(node, associateTag) {
	const lines = splitParagraphLines(node.children);
	const replacements = [];
	let normalLines = [];
	let didTransform = false;

	const flushNormalLines = () => {
		const paragraph = paragraphFromLines(normalLines);
		if (paragraph) replacements.push(paragraph);
		normalLines = [];
	};

	for (const line of lines) {
		const standaloneLink = extractStandaloneLink({ children: line });
		if (!standaloneLink) {
			normalLines.push(line);
			continue;
		}

		flushNormalLines();
		replacements.push(
			cardOrEmbed(standaloneLink.url, standaloneLink.label, associateTag),
		);
		didTransform = true;
	}

	flushNormalLines();
	return didTransform ? replacements : null;
}

function transformTree(node, associateTag) {
	if (!Array.isArray(node?.children)) return;

	for (let index = 0; index < node.children.length; index += 1) {
		const child = node.children[index];
		if (child.type === "element" && child.tagName === "p") {
			const replacements = transformParagraph(child, associateTag);
			if (replacements) {
				node.children.splice(index, 1, ...replacements);
				index += replacements.length - 1;
				continue;
			}
		}

		transformTree(child, associateTag);
	}
}

/**
 * Turns a standalone URL paragraph into a media embed or a link card.
 * Inline links, linked images and URLs mixed with other text remain untouched.
 */
export function rehypeSmartEmbeds(options = {}) {
	const associateTag = normalizeAssociateTag(
		options.amazonAssociateTag ?? process.env.PUBLIC_AMAZON_ASSOCIATE_TAG,
	);

	return (tree) => {
		transformTree(tree, associateTag);
	};
}

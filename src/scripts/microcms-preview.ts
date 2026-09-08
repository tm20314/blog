import type { MicroCMSArticle } from "@/types/editorial-blocks";

type RawBlock = Record<string, unknown>;

const asText = (value: unknown) =>
	typeof value === "string" ? value.trim() : "";
const asRecord = (value: unknown): RawBlock =>
	value && typeof value === "object" ? (value as RawBlock) : {};
const lines = (value: unknown) =>
	asText(value)
		.split(/\r?\n/u)
		.map((item) => item.trim())
		.filter(Boolean);
const cells = (value: unknown) =>
	asText(value)
		.split(/[|｜]/u)
		.map((item) => item.trim())
		.filter(Boolean);

function make<K extends keyof HTMLElementTagNameMap>(
	tag: K,
	className?: string,
	text?: string,
) {
	const node = document.createElement(tag);
	if (className) node.className = className;
	if (text) node.textContent = text;
	return node;
}

function safeUrl(value: unknown, media = false) {
	const raw = asText(value);
	if (!raw) return "";
	if (raw.startsWith("/") || (!media && raw.startsWith("#"))) return raw;
	try {
		const parsed = new URL(raw);
		const allowed = media
			? ["http:", "https:"]
			: ["http:", "https:", "mailto:"];
		return allowed.includes(parsed.protocol) ? parsed.toString() : "";
	} catch {
		return "";
	}
}

function sanitizeRichText(html: unknown) {
	const documentFragment = new DOMParser().parseFromString(
		asText(html),
		"text/html",
	);
	const allowedTags = new Set([
		"A",
		"BLOCKQUOTE",
		"BR",
		"CODE",
		"DEL",
		"EM",
		"FIGCAPTION",
		"FIGURE",
		"H2",
		"H3",
		"H4",
		"HR",
		"IMG",
		"LI",
		"OL",
		"P",
		"PRE",
		"S",
		"STRONG",
		"TABLE",
		"TBODY",
		"TD",
		"TH",
		"THEAD",
		"TR",
		"U",
		"UL",
	]);
	const blockedTags = new Set(["IFRAME", "OBJECT", "SCRIPT", "STYLE", "SVG"]);

	// Attribute values are captured before the allow-list pass.
	for (const element of [...documentFragment.body.querySelectorAll("*")]) {
		element.setAttribute(
			"data-preview-href",
			element.getAttribute("href") ?? "",
		);
		element.setAttribute("data-preview-src", element.getAttribute("src") ?? "");
		element.setAttribute("data-preview-alt", element.getAttribute("alt") ?? "");
		element.setAttribute(
			"data-preview-colspan",
			element.getAttribute("colspan") ?? "",
		);
		element.setAttribute(
			"data-preview-rowspan",
			element.getAttribute("rowspan") ?? "",
		);
	}

	const finish = (element: Element) => {
		for (const child of [...element.children]) finish(child);
		if (blockedTags.has(element.tagName)) {
			element.remove();
			return;
		}
		if (!allowedTags.has(element.tagName)) {
			element.replaceWith(...element.childNodes);
			return;
		}
		const href = element.getAttribute("data-preview-href");
		const src = element.getAttribute("data-preview-src");
		const alt = element.getAttribute("data-preview-alt");
		const colspan = element.getAttribute("data-preview-colspan");
		const rowspan = element.getAttribute("data-preview-rowspan");
		for (const attribute of [...element.attributes])
			element.removeAttribute(attribute.name);

		if (element instanceof HTMLAnchorElement) {
			const hrefValue = safeUrl(href);
			if (hrefValue) element.href = hrefValue;
			element.target = "_blank";
			element.rel = "noopener noreferrer";
		}
		if (element instanceof HTMLImageElement) {
			const srcValue = safeUrl(src, true);
			if (!srcValue) {
				element.remove();
				return;
			}
			element.src = srcValue;
			element.alt = alt ?? "";
			element.loading = "lazy";
			element.decoding = "async";
		}
		if (element instanceof HTMLTableCellElement) {
			if (/^\d{1,2}$/u.test(colspan ?? "")) element.colSpan = Number(colspan);
			if (/^\d{1,2}$/u.test(rowspan ?? "")) element.rowSpan = Number(rowspan);
		}
	};

	// Only allow-listed markup reaches the page.
	for (const child of [...documentFragment.body.children]) finish(child);
	return documentFragment.body.innerHTML;
}

function appendRich(parent: HTMLElement, html: unknown, className?: string) {
	const body = make("div", className);
	body.innerHTML = sanitizeRichText(html);
	parent.append(body);
	return body;
}

function renderBlock(block: RawBlock) {
	const fieldId = asText(block.fieldId);
	if (fieldId === "richText") {
		const node = make("div", "structured-article__rich-text");
		node.innerHTML = sanitizeRichText(block.body);
		return node;
	}
	if (fieldId === "box") {
		const tone = ["note", "point", "check", "warning"].includes(
			asText(block.tone),
		)
			? asText(block.tone)
			: "note";
		const node = make("aside", `editor-block editor-box editor-box--${tone}`);
		if (asText(block.title))
			node.append(make("p", "editor-box__title", asText(block.title)));
		appendRich(node, block.body, "editor-box__body");
		return node;
	}
	if (fieldId === "button") {
		const link = make(
			"a",
			`editor-block editor-button editor-button--${asText(block.variant) === "secondary" ? "secondary" : "primary"} no-styling`,
		);
		link.href = safeUrl(block.url) || "#";
		link.target = "_blank";
		link.rel = "noopener noreferrer";
		link.append(
			make("span", "", asText(block.label) || "リンク"),
			make("span", "editor-button__icon", "↗"),
		);
		return link;
	}
	if (fieldId === "speech") {
		const side = asText(block.side) === "right" ? "right" : "left";
		const node = make(
			"aside",
			`editor-block editor-speech editor-speech--${side}`,
		);
		const person = make("div", "editor-speech__person");
		const avatar = make("span", "editor-speech__avatar");
		const avatarUrl = safeUrl(asRecord(block.avatar).url, true);
		if (avatarUrl) {
			const image = make("img");
			image.src = avatarUrl;
			image.alt = "";
			avatar.append(image);
		} else avatar.append(make("span", "editor-speech__symbol", "つ"));
		person.append(
			avatar,
			make("span", "editor-speech__name", asText(block.name) || "つもつも"),
		);
		node.append(person);
		appendRich(node, block.body, "editor-speech__body");
		return node;
	}
	if (fieldId === "faq") {
		const node = make("section", "editor-block editor-faq");
		const question = make("h3", "editor-faq__question");
		question.append(
			make("span", "editor-faq__mark", "Q"),
			make("span", "editor-faq__title", asText(block.question)),
		);
		const answer = make("div", "editor-faq__answer");
		answer.append(make("span", "editor-faq__mark", "A"));
		appendRich(answer, block.answer, "editor-faq__body");
		node.append(question, answer);
		return node;
	}
	if (fieldId === "accordion") {
		const node = make("details", "editor-block editor-accordion");
		node.append(
			make(
				"summary",
				"editor-accordion__summary",
				asText(block.title) || "詳しく見る",
			),
		);
		appendRich(node, block.body, "editor-accordion__body");
		return node;
	}
	if (fieldId === "stepList") {
		const node = make("section", "editor-block editor-step-list");
		if (asText(block.title))
			node.append(make("h3", "editor-step-list__title", asText(block.title)));
		const list = make("ol", "editor-steps");
		for (const line of lines(block.itemsText)) {
			const [title, ...body] = cells(line);
			const item = make("li", "editor-step");
			item.append(make("p", "editor-step__title", title));
			appendRich(item, body.join("｜"), "editor-step__body");
			list.append(item);
		}
		node.append(list);
		return node;
	}
	if (fieldId === "prosCons") {
		const node = make("section", "editor-block editor-pros-cons");
		node.append(
			make(
				"h3",
				"editor-pros-cons__title",
				asText(block.title) || "良かった点・気になった点",
			),
		);
		const grid = make("div", "editor-pros-cons__grid");
		for (const [heading, values, className] of [
			["良かった点", lines(block.prosText), "editor-pros"],
			["気になった点", lines(block.consText), "editor-cons"],
		] as const) {
			const section = make("section", `editor-pros-cons__section ${className}`);
			section.append(make("h4", "editor-pros-cons__heading", heading));
			const list = make("ul");
			for (const value of values) list.append(make("li", "", value));
			section.append(list);
			grid.append(section);
		}
		node.append(grid);
		return node;
	}
	if (fieldId === "comparison") {
		const figure = make("figure", "editor-block editor-comparison");
		figure.append(
			make(
				"figcaption",
				"editor-comparison__caption",
				asText(block.caption) || "比較表",
			),
		);
		const scroll = make("div", "editor-comparison__scroll");
		scroll.tabIndex = 0;
		const table = make("table");
		const headRow = make("tr");
		for (const value of cells(block.headersText)) {
			const heading = make("th", "", value);
			heading.scope = "col";
			headRow.append(heading);
		}
		const head = make("thead");
		head.append(headRow);
		const body = make("tbody");
		for (const rowText of lines(block.rowsText)) {
			const row = make("tr");
			cells(rowText).forEach((value, index) => {
				const cell = make(index === 0 ? "th" : "td", "", value);
				if (cell instanceof HTMLTableCellElement && index === 0)
					cell.scope = "row";
				row.append(cell);
			});
			body.append(row);
		}
		table.append(head, body);
		scroll.append(table);
		figure.append(scroll);
		return figure;
	}
	if (fieldId === "product") {
		const node = make("aside", "editor-block editor-product");
		const imageUrl = safeUrl(asRecord(block.image).url, true);
		if (imageUrl) {
			const media = make("figure", "editor-product__media");
			const image = make("img");
			image.src = imageUrl;
			image.alt = asText(asRecord(block.image).alt);
			image.loading = "lazy";
			media.append(image);
			node.append(media);
		}
		const body = make("div", "editor-product__body");
		body.append(
			make("p", "editor-product__eyebrow", "紹介した製品"),
			make("h3", "editor-product__title", asText(block.name)),
		);
		if (asText(block.summary))
			body.append(make("p", "editor-product__summary", asText(block.summary)));
		const actions = make("div", "editor-product__actions");
		for (const [label, value, affiliate] of [
			["Amazonで見る", block.amazonUrl, true],
			["楽天で見る", block.rakutenUrl, true],
			["公式サイト", block.officialUrl, false],
		] as const) {
			const href = safeUrl(value);
			if (!href) continue;
			const link = make("a", "no-styling");
			link.href = href;
			link.target = "_blank";
			link.rel = affiliate
				? "sponsored noopener noreferrer"
				: "noopener noreferrer";
			link.append(label, make("span", "editor-product__action-icon", "↗"));
			actions.append(link);
		}
		body.append(
			actions,
			make(
				"small",
				"editor-product__disclosure",
				asText(block.disclosure) ||
					"リンクにはアフィリエイトを含む場合があります。",
			),
		);
		node.append(body);
		return node;
	}
	return null;
}

function formatDate(value: unknown) {
	const date = new Date(asText(value));
	if (Number.isNaN(date.getTime())) return "";
	return new Intl.DateTimeFormat("ja-JP", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(date);
}

export async function initMicroCMSPreview() {
	const root = document.querySelector<HTMLElement>("[data-preview-root]");
	const status = document.querySelector<HTMLElement>("[data-preview-status]");
	if (!root || !status) return;

	const params = new URLSearchParams(window.location.hash.replace(/^#/u, ""));
	const contentId = params.get("contentId")?.trim() ?? "";
	const draftKey = params.get("draftKey")?.trim() ?? "";
	history.replaceState(
		null,
		"",
		`${window.location.pathname}${window.location.search}`,
	);

	if (!contentId || !draftKey) {
		status.textContent =
			"microCMSの記事編集画面から「画面プレビュー」を開いてください。";
		status.dataset.state = "error";
		return;
	}

	try {
		const response = await fetch("/api/preview", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ contentId, draftKey }),
			cache: "no-store",
			credentials: "same-origin",
		});
		const payload = (await response.json()) as MicroCMSArticle & {
			error?: string;
		};
		if (!response.ok)
			throw new Error(
				payload.error || "記事プレビューを取得できませんでした。",
			);

		const title = asText(payload.title) || "無題の記事";
		const description = asText(payload.description);
		const categoryValue = payload.category;
		const category =
			typeof categoryValue === "string"
				? categoryValue
				: asText(asRecord(categoryValue).name) || "未分類";
		const tags = [
			...new Set(
				[
					...(Array.isArray(payload.tags) ? payload.tags.map(asText) : []),
					...lines(payload.tagsText),
				].filter(Boolean),
			),
		];

		document.title = `${title}（プレビュー）| つもログ`;
		const titleNode = root.querySelector<HTMLElement>("[data-preview-title]");
		const descriptionNode = root.querySelector<HTMLElement>(
			"[data-preview-description]",
		);
		const categoryNode = root.querySelector<HTMLElement>(
			"[data-preview-category]",
		);
		const factsNode = root.querySelector<HTMLElement>("[data-preview-facts]");
		const tagsNode = root.querySelector<HTMLElement>("[data-preview-tags]");
		const cover = root.querySelector<HTMLImageElement>("[data-preview-cover]");
		const body = root.querySelector<HTMLElement>("[data-preview-body]");
		if (
			!titleNode ||
			!descriptionNode ||
			!categoryNode ||
			!factsNode ||
			!tagsNode ||
			!cover ||
			!body
		)
			return;

		titleNode.textContent = title;
		descriptionNode.textContent = description;
		descriptionNode.hidden = !description;
		categoryNode.textContent = category;
		const published = formatDate(payload.publishedAt || payload.createdAt);
		const updated = formatDate(payload.revisedAt || payload.updatedAt);
		factsNode.replaceChildren();
		if (published) factsNode.append(make("span", "", `公開 ${published}`));
		if (updated) factsNode.append(make("span", "", `更新 ${updated}`));
		factsNode.append(make("span", "preview-only-label", "下書きプレビュー"));
		tagsNode.replaceChildren(...tags.map((tag) => make("span", "", `#${tag}`)));
		tagsNode.hidden = tags.length === 0;

		const eyecatch = asRecord(payload.eyecatch);
		const coverValue = safeUrl(
			eyecatch.url || asRecord(payload.cover).url,
			true,
		);
		cover.src = coverValue || "/images/default-thumbnail.png";
		cover.alt = coverValue ? `${title}のアイキャッチ画像` : "";

		body.replaceChildren();
		if (asText(payload.content)) {
			const content = make("div", "structured-article__rich-text");
			content.innerHTML = sanitizeRichText(payload.content);
			body.append(content);
		}
		for (const rawBlock of payload.blocks ?? []) {
			const block = renderBlock(asRecord(rawBlock));
			if (block) body.append(block);
		}
		if (!body.textContent?.trim() && !body.querySelector("img")) {
			body.append(make("p", "preview-empty", "本文はまだ入力されていません。"));
		}

		status.hidden = true;
		root.hidden = false;
	} catch (error) {
		status.textContent =
			error instanceof Error
				? error.message
				: "記事プレビューを取得できませんでした。";
		status.dataset.state = "error";
	}
}

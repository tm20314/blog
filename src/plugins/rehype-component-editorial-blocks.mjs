import { h } from "hastscript";

const BOX_TYPES = new Set(["note", "point", "check", "warning"]);
const BUTTON_VARIANTS = new Set(["primary", "secondary"]);
const SPEECH_SIDES = new Set(["left", "right"]);

function safeValue(value, fallback = "") {
	return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function safeHref(value) {
	const href = safeValue(value, "#");
	return /^(?:https?:\/\/|mailto:|\/|#)/u.test(href) ? href : "#";
}

function safeMediaUrl(value) {
	const src = safeValue(value);
	return /^(?:https?:\/\/|\/)/u.test(src) ? src : "";
}

function nodeText(nodes) {
	return nodes
		.flatMap((node) => {
			if (node.type === "text") return [node.value];
			if (Array.isArray(node.children)) return [nodeText(node.children)];
			return [];
		})
		.join("")
		.trim();
}

function labelNode(text, className) {
	return h("span", { class: className }, text);
}

export function EditorialBoxComponent(properties = {}, children = []) {
	const type = BOX_TYPES.has(properties.type) ? properties.type : "note";
	const title = safeValue(properties.title);

	return h(
		"aside",
		{ class: `editor-block editor-box editor-box--${type}` },
		[
			title ? h("p", { class: "editor-box__title" }, title) : null,
			h("div", { class: "editor-box__body" }, children),
		].filter(Boolean),
	);
}

export function EditorialButtonComponent(properties = {}, children = []) {
	const variant = BUTTON_VARIANTS.has(properties.variant)
		? properties.variant
		: "primary";
	const href = safeHref(properties.href);
	const label = safeValue(properties.label, "リンクを開く");
	const content = children.length
		? children
		: [labelNode(label, "editor-button__label")];

	return h(
		"a",
		{
			class: `editor-block editor-button editor-button--${variant} no-styling`,
			href,
		},
		[...content, labelNode("↗", "editor-button__icon")],
	);
}

export function EditorialSpeechComponent(properties = {}, children = []) {
	const side = SPEECH_SIDES.has(properties.side) ? properties.side : "left";
	const name = safeValue(properties.name, "つもつも");
	const avatar = safeValue(properties.avatar);
	const avatarNode = avatar
		? h("img", { src: avatar, alt: "", loading: "lazy", decoding: "async" })
		: labelNode("つ", "editor-speech__symbol");

	return h(
		"aside",
		{
			class: `editor-block editor-speech editor-speech--${side}`,
			"aria-label": `${name}のコメント`,
		},
		[
			h("div", { class: "editor-speech__person" }, [
				h("span", { class: "editor-speech__avatar", "aria-hidden": "true" }, [
					avatarNode,
				]),
				h("span", { class: "editor-speech__name" }, name),
			]),
			h("div", { class: "editor-speech__body" }, children),
		],
	);
}

export function EditorialFaqComponent(properties = {}, children = []) {
	const question = safeValue(properties.question, "よくある質問");

	return h("section", { class: "editor-block editor-faq" }, [
		h("h3", { class: "editor-faq__question" }, [
			labelNode("Q", "editor-faq__mark"),
			labelNode(question, "editor-faq__title"),
		]),
		h("div", { class: "editor-faq__answer" }, [
			labelNode("A", "editor-faq__mark"),
			h("div", { class: "editor-faq__body" }, children),
		]),
	]);
}

export function EditorialAccordionComponent(properties = {}, children = []) {
	const title = safeValue(properties.title, "続きを読む");

	return h("details", { class: "editor-block editor-accordion" }, [
		h("summary", { class: "editor-accordion__summary" }, title),
		h("div", { class: "editor-accordion__body" }, children),
	]);
}

export function EditorialStepsComponent(_properties = {}, children = []) {
	return h("ol", { class: "editor-block editor-steps" }, children);
}

export function EditorialStepComponent(properties = {}, children = []) {
	const title = safeValue(properties.title, "手順");

	return h("li", { class: "editor-step" }, [
		h("p", { class: "editor-step__title" }, title),
		h("div", { class: "editor-step__body" }, children),
	]);
}

export function EditorialProsConsComponent(properties = {}, children = []) {
	const title = safeValue(properties.title, "良かった点・気になった点");

	return h("section", { class: "editor-block editor-pros-cons" }, [
		h("h3", { class: "editor-pros-cons__title" }, title),
		h("div", { class: "editor-pros-cons__grid" }, children),
	]);
}

export function EditorialProsComponent(_properties = {}, children = []) {
	return h("section", { class: "editor-pros-cons__section editor-pros" }, [
		h("h4", { class: "editor-pros-cons__heading" }, "良かった点"),
		...children,
	]);
}

export function EditorialConsComponent(_properties = {}, children = []) {
	return h("section", { class: "editor-pros-cons__section editor-cons" }, [
		h("h4", { class: "editor-pros-cons__heading" }, "気になった点"),
		...children,
	]);
}

export function EditorialComparisonComponent(properties = {}, children = []) {
	const caption = safeValue(properties.caption, "比較表");

	return h("figure", { class: "editor-block editor-comparison" }, [
		h("figcaption", { class: "editor-comparison__caption" }, caption),
		h("div", { class: "editor-comparison__scroll", tabindex: "0" }, children),
	]);
}

export function EditorialProductComponent(properties = {}, children = []) {
	const name = safeValue(properties.name, nodeText(children) || "紹介した製品");
	const image = safeMediaUrl(properties.image);
	const summary = safeValue(properties.summary);
	const disclosure = safeValue(
		properties.disclosure,
		"リンクにはアフィリエイトを含む場合があります。",
	);
	const candidates = [
		{
			label: "Amazonで見る",
			href: safeHref(properties.amazon),
			sponsored: true,
		},
		{
			label: "楽天で見る",
			href: safeHref(properties.rakuten),
			sponsored: true,
		},
		{
			label: "公式サイト",
			href: safeHref(properties.official),
			sponsored: false,
		},
	].filter((link) => link.href !== "#");

	return h(
		"aside",
		{ class: "editor-block editor-product" },
		[
			image
				? h("figure", { class: "editor-product__media" }, [
						h("img", {
							src: image,
							alt: safeValue(properties.alt),
							loading: "lazy",
							decoding: "async",
						}),
					])
				: null,
			h(
				"div",
				{ class: "editor-product__body" },
				[
					h("p", { class: "editor-product__eyebrow" }, "紹介した製品"),
					h("h3", { class: "editor-product__title" }, name),
					summary
						? h("p", { class: "editor-product__summary" }, summary)
						: null,
					candidates.length
						? h(
								"div",
								{ class: "editor-product__actions" },
								candidates.map((link) =>
									h(
										"a",
										{
											class: "no-styling",
											href: link.href,
											rel: link.sponsored ? "sponsored noopener" : "noopener",
										},
										[link.label, labelNode("↗", "editor-product__action-icon")],
									),
								),
							)
						: null,
					h("small", { class: "editor-product__disclosure" }, disclosure),
				].filter(Boolean),
			),
		].filter(Boolean),
	);
}

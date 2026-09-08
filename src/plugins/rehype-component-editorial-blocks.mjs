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
	const content = children.length ? children : [labelNode(label, "editor-button__label")];

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
			h("span", { class: "editor-speech__avatar", "aria-hidden": "true" }, [avatarNode]),
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

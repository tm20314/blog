import assert from "node:assert/strict";
import test from "node:test";
import {
	EditorialAccordionComponent,
	EditorialBoxComponent,
	EditorialButtonComponent,
	EditorialFaqComponent,
	EditorialSpeechComponent,
	EditorialStepComponent,
	EditorialStepsComponent,
} from "../src/plugins/rehype-component-editorial-blocks.mjs";

const text = (value) => ({ type: "text", value });
const paragraph = (value) => ({
	type: "element",
	tagName: "p",
	properties: {},
	children: [text(value)],
});

test("editorial box keeps its supported visual type and content", () => {
	const block = EditorialBoxComponent(
		{ type: "warning", title: "注意" },
		[paragraph("バックアップを取ってください。")],
	);

	assert.equal(block.tagName, "aside");
	assert.match(block.properties.className.join(" "), /editor-box--warning/u);
	assert.equal(block.children[0].children[0].value, "注意");
});

test("button rejects unsafe protocols", () => {
	const button = EditorialButtonComponent({ href: "javascript:alert(1)" }, []);

	assert.equal(button.tagName, "a");
	assert.equal(button.properties.href, "#");
});

test("speech, FAQ, accordion and steps use semantic elements", () => {
	const speech = EditorialSpeechComponent({ name: "つもつも" }, [paragraph("本文")]);
	const faq = EditorialFaqComponent({ question: "無料ですか？" }, [paragraph("はい。")]);
	const accordion = EditorialAccordionComponent({ title: "詳細" }, [paragraph("本文")]);
	const step = EditorialStepComponent({ title: "準備" }, [paragraph("本文")]);
	const steps = EditorialStepsComponent({}, [step]);

	assert.equal(speech.tagName, "aside");
	assert.equal(faq.tagName, "section");
	assert.equal(accordion.tagName, "details");
	assert.equal(steps.tagName, "ol");
	assert.equal(steps.children[0].tagName, "li");
});

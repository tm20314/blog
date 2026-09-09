import assert from "node:assert/strict";
import test from "node:test";
import {
	CMS_RICH_TEXT_CLASSES,
	filterCMSRichTextClasses,
} from "../src/utils/cms-rich-text";

test("microCMS本文では登録済みの装飾classだけを許可する", () => {
	assert.equal(CMS_RICH_TEXT_CLASSES.length, 12);
	assert.deepEqual(
		filterCMSRichTextClasses(
			"cms-box-point hidden cms-button-primary unknown-class",
		),
		["cms-box-point", "cms-button-primary"],
	);
	assert.deepEqual(filterCMSRichTextClasses(null), []);
});

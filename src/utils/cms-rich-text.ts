export const CMS_RICH_TEXT_CLASSES = [
	"cms-marker-yellow",
	"cms-marker-green",
	"cms-box-note",
	"cms-box-point",
	"cms-box-check",
	"cms-box-warning",
	"cms-button-primary",
	"cms-button-secondary",
	"cms-speech-left",
	"cms-speech-right",
	"cms-faq-question",
	"cms-faq-answer",
] as const;

const cmsRichTextClassSet = new Set<string>(CMS_RICH_TEXT_CLASSES);

export function filterCMSRichTextClasses(value: unknown) {
	if (typeof value !== "string") return [];
	return value
		.split(/\s+/u)
		.map((className) => className.trim())
		.filter((className) => cmsRichTextClassSet.has(className));
}

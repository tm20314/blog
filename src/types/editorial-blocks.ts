export type EditorialTone = "note" | "point" | "check" | "warning";

export type MicroCMSImage = {
	url: string;
	width?: number;
	height?: number;
	alt?: string;
};

export type RichTextBlock = {
	fieldId: "richText";
	body: string;
};

export type BoxBlock = {
	fieldId: "box";
	tone: EditorialTone;
	title?: string;
	body: string;
};

export type ButtonBlock = {
	fieldId: "button";
	label: string;
	url: string;
	variant?: "primary" | "secondary";
};

export type SpeechBlock = {
	fieldId: "speech";
	name?: string;
	avatar?: MicroCMSImage;
	side?: "left" | "right";
	body: string;
};

export type FaqBlock = {
	fieldId: "faq";
	question: string;
	answer: string;
};

export type AccordionBlock = {
	fieldId: "accordion";
	title: string;
	body: string;
};

export type StepListBlock = {
	fieldId: "stepList";
	title?: string;
	items: Array<{
		title: string;
		body: string;
	}>;
};

export type ProsConsBlock = {
	fieldId: "prosCons";
	title?: string;
	pros: string[];
	cons: string[];
};

export type ComparisonBlock = {
	fieldId: "comparison";
	caption?: string;
	headers: string[];
	rows: string[][];
};

export type ProductBlock = {
	fieldId: "product";
	name: string;
	summary?: string;
	image?: MicroCMSImage;
	disclosure?: string;
	links: Array<{
		label: string;
		url: string;
		type?: "affiliate" | "official";
	}>;
};

export type EditorialBlock =
	| RichTextBlock
	| BoxBlock
	| ButtonBlock
	| SpeechBlock
	| FaqBlock
	| AccordionBlock
	| StepListBlock
	| ProsConsBlock
	| ComparisonBlock
	| ProductBlock;

export type MicroCMSArticle = {
	id: string;
	createdAt: string;
	updatedAt: string;
	publishedAt?: string;
	revisedAt?: string;
	title: string;
	slug?: string;
	description?: string;
	cover?: MicroCMSImage;
	category?: string;
	tags?: string[];
	blocks: EditorialBlock[];
};

export type MicroCMSListResponse<T> = {
	contents: T[];
	totalCount: number;
	offset: number;
	limit: number;
};

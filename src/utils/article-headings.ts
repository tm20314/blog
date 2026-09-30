export type ArticleHeading = { depth: number; slug: string; text: string };
export function headingSlugger() {
	const used = new Set<string>();
	return (text: string) => {
		const base = `section-${
			text
				.normalize("NFKC")
				.toLowerCase()
				.replace(/[^\p{L}\p{N}\s-]/gu, "")
				.trim()
				.replace(/\s+/gu, "-")
				.slice(0, 90) || "heading"
		}`;
		let slug = base;
		let index = 2;
		while (used.has(slug)) slug = `${base}-${index++}`;
		used.add(slug);
		return slug;
	};
}
export function annotateRichTextHeadings(root: HTMLElement): ArticleHeading[] {
	const slug = headingSlugger();
	return Array.from(
		root.querySelectorAll<HTMLElement>(
			".structured-article__rich-text h2, .structured-article__rich-text h3, .structured-article__rich-text h4",
		),
	).map((heading) => {
		const text = heading.textContent?.trim() || "見出し";
		heading.id = slug(text);
		return { depth: Number(heading.tagName.slice(1)), slug: heading.id, text };
	});
}
export function updatePreviewTOC(root: HTMLElement) {
	const headings = annotateRichTextHeadings(root);
	const toc = document.querySelector<HTMLElement>("[data-preview-toc]");
	if (!toc) return;
	const list = toc.querySelector("ol");
	if (!list) return;
	list.replaceChildren();
	for (const heading of headings) {
		const item = document.createElement("li");
		const link = document.createElement("a");
		link.href = `#${heading.slug}`;
		link.textContent = heading.text;
		item.append(link);
		list.append(item);
	}
	toc.hidden = !headings.length;
}

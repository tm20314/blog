import { isTrustedArticleImage } from "../lib/remote-image-size.mjs";
import type { ArticleEntry } from "./content-utils";
export function representativeImage(post: ArticleEntry): string {
	if (post.data.image) return post.data.image;
	if (post.source !== "local") return "";
	const source = (post.localEntry.body || "").replace(
		/^```[\s\S]*?^```/gmu,
		"",
	);
	for (const match of source.matchAll(
		/!\[[^\]]*\]\(\s*(https:\/\/[^\s)]+)[^)]*\)/gu,
	)) {
		if (isTrustedArticleImage(match[1])) return match[1];
	}
	return "";
}

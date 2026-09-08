import type { CollectionEntry } from "astro:content";

type Post = CollectionEntry<"posts">;

function normalized(value: string | null | undefined) {
	return value?.trim().toLocaleLowerCase("ja") ?? "";
}

export function selectRelatedPosts(
	current: Post,
	candidates: Post[],
	limit = 3,
): Post[] {
	const currentCategory = normalized(current.data.category);
	const currentTags = new Set(current.data.tags.map(normalized));

	return candidates
		.filter((post) => post.slug !== current.slug)
		.map((post) => {
			const sharedTags = post.data.tags.reduce(
				(count, tag) => count + (currentTags.has(normalized(tag)) ? 1 : 0),
				0,
			);
			const sameCategory =
				currentCategory !== "" &&
				normalized(post.data.category) === currentCategory;

			return {
				post,
				score: sharedTags * 3 + (sameCategory ? 2 : 0),
			};
		})
		.sort((a, b) => {
			if (a.score !== b.score) return b.score - a.score;
			return b.post.data.published.getTime() - a.post.data.published.getTime();
		})
		.slice(0, Math.max(0, limit))
		.map(({ post }) => post);
}

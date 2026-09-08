import { type CollectionEntry, getCollection } from "astro:content";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { getCategoryUrl } from "@utils/url-utils.ts";
import {
	getAllMicroCMSArticles,
	isMicroCMSConfigured,
	normalizeMicroCMSArticle,
} from "@/lib/microcms";
import type { NormalizedMicroCMSArticle } from "@/types/editorial-blocks";

export type ArticleData = {
	title: string;
	published: Date;
	updated?: Date;
	description: string;
	image: string;
	tags: string[];
	category: string | null;
	lang: string;
	prevTitle?: string;
	prevSlug?: string;
	nextTitle?: string;
	nextSlug?: string;
};

export type ArticleEntry =
	| {
			source: "local";
			id: string;
			slug: string;
			data: ArticleData;
			localEntry: CollectionEntry<"posts">;
	  }
	| {
			source: "microcms";
			id: string;
			slug: string;
			data: ArticleData;
			cmsArticle: NormalizedMicroCMSArticle;
	  };

const splitTags = (value: string | undefined) =>
	(value ?? "")
		.split(/[,、\r\n]+/u)
		.map((tag) => tag.trim())
		.filter(Boolean);

async function getMicroCMSPosts(): Promise<ArticleEntry[]> {
	if (!isMicroCMSConfigured) return [];

	try {
		const articles = await getAllMicroCMSArticles();
		return articles.flatMap((article) => {
			const normalized = normalizeMicroCMSArticle(article);
			if (!normalized) return [];
			const published = new Date(
				normalized.publishedAt ?? normalized.createdAt,
			);
			const updated = new Date(normalized.revisedAt ?? normalized.updatedAt);
			return [
				{
					source: "microcms" as const,
					id: normalized.id,
					slug: normalized.slug,
					data: {
						title: normalized.title,
						published,
						updated,
						description: normalized.description?.trim() ?? "",
						image: (normalized.eyecatch ?? normalized.cover)?.url ?? "",
						tags: normalized.tags ?? splitTags(normalized.tagsText),
						category: normalized.category,
						lang: "ja",
					},
					cmsArticle: normalized,
				},
			];
		});
	} catch (error) {
		console.warn(
			"microCMSの記事取得に失敗したため、ローカル記事のみで続行します。",
			error instanceof Error ? error.message : "Unknown error",
		);
		return [];
	}
}

// // Retrieve posts and sort them by publication date
async function getRawSortedPosts() {
	const allBlogPosts = await getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});
	const localPosts: ArticleEntry[] = allBlogPosts.map((entry) => ({
		source: "local",
		id: entry.id,
		slug: entry.slug,
		data: {
			title: entry.data.title,
			published: entry.data.published,
			updated: entry.data.updated,
			description: entry.data.description,
			image: entry.data.image,
			tags: entry.data.tags,
			category: entry.data.category,
			lang: entry.data.lang,
		},
		localEntry: entry,
	}));
	const localSlugs = new Set(localPosts.map((post) => post.slug));
	const cmsPosts = (await getMicroCMSPosts()).filter(
		(post) => !localSlugs.has(post.slug),
	);

	const sorted = [...localPosts, ...cmsPosts].sort((a, b) => {
		const dateA = new Date(a.data.published);
		const dateB = new Date(b.data.published);
		return dateA > dateB ? -1 : 1;
	});
	return sorted;
}

export async function getSortedPosts() {
	const sorted = await getRawSortedPosts();

	for (let i = 1; i < sorted.length; i++) {
		sorted[i].data.nextSlug = sorted[i - 1].slug;
		sorted[i].data.nextTitle = sorted[i - 1].data.title;
	}
	for (let i = 0; i < sorted.length - 1; i++) {
		sorted[i].data.prevSlug = sorted[i + 1].slug;
		sorted[i].data.prevTitle = sorted[i + 1].data.title;
	}

	return sorted;
}
export type PostForList = {
	id: string;
	slug: string;
	source: ArticleEntry["source"];
	data: ArticleData;
};
export async function getSortedPostsList(): Promise<PostForList[]> {
	const sortedFullPosts = await getRawSortedPosts();

	// delete post.body
	const sortedPostsList = sortedFullPosts.map((post) => ({
		id: post.id,
		slug: post.slug,
		source: post.source,
		data: post.data,
	}));

	return sortedPostsList;
}
export type Tag = {
	name: string;
	count: number;
};

export async function getTagList(): Promise<Tag[]> {
	const allBlogPosts = await getRawSortedPosts();

	const countMap: { [key: string]: number } = {};
	allBlogPosts.forEach((post: { data: { tags: string[] } }) => {
		post.data.tags.forEach((tag: string) => {
			if (!countMap[tag]) countMap[tag] = 0;
			countMap[tag]++;
		});
	});

	// sort tags
	const keys: string[] = Object.keys(countMap).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	return keys.map((key) => ({ name: key, count: countMap[key] }));
}

export type Category = {
	name: string;
	count: number;
	url: string;
};

export async function getCategoryList(): Promise<Category[]> {
	const allBlogPosts = await getRawSortedPosts();
	const count: { [key: string]: number } = {};
	allBlogPosts.forEach((post: { data: { category: string | null } }) => {
		if (!post.data.category) {
			const ucKey = i18n(I18nKey.uncategorized);
			count[ucKey] = count[ucKey] ? count[ucKey] + 1 : 1;
			return;
		}

		const categoryName =
			typeof post.data.category === "string"
				? post.data.category.trim()
				: String(post.data.category).trim();

		count[categoryName] = count[categoryName] ? count[categoryName] + 1 : 1;
	});

	const lst = Object.keys(count).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	const ret: Category[] = [];
	for (const c of lst) {
		ret.push({
			name: c,
			count: count[c],
			url: getCategoryUrl(c),
		});
	}
	return ret;
}

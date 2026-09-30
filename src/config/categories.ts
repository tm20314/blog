export const categoryPages = [
	{
		name: "Flutter",
		slug: "flutter",
		description:
			"Flutterでのアプリ開発、エラーの対処、公開後の運用について書いた記事です。",
	},
	{
		name: "iOS",
		slug: "ios",
		description:
			"SwiftやUIKit、SwiftUIを使ったiOSアプリ開発の記録と、つまずいた点の対処をまとめています。",
	},
	{
		name: "就活",
		slug: "career",
		description:
			"エンジニアの就職活動やインターンに参加した経験をまとめた記事です。",
	},
] as const;

export function normalizeCategory(category: string | null | undefined) {
	const value = category?.trim() || "";
	return value === "iOS,Swift" || value === "Swift" ? "iOS" : value;
}

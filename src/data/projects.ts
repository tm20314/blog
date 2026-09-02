export type Project = {
	name: string;
	kicker: string;
	description: string;
	proof: string;
	stack: string[];
	href: string;
	linkLabel: string;
};

export const projects: Project[] = [
	{
		name: "岡山理科大学 非公式アプリ",
		kicker: "Campus utility",
		description:
			"大学のニュースや連絡先、講義評価をひとつにまとめた学生向けモバイルアプリ。企画からリリース、改善まで個人で取り組みました。",
		proof: "記事公開時点で利用者1,000人超",
		stack: ["Flutter", "Firebase"],
		href: "/posts/retention-crisis-to-1000-users/",
		linkLabel: "制作背景を読む",
	},
	{
		name: "MotoParking",
		kicker: "Motorcycle utility",
		description:
			"二輪車の駐車場情報を扱う個人開発アプリ。公開後も、利用規約やデータの扱いを含めて運用を続けています。",
		proof: "個人開発・運用中",
		stack: ["Mobile", "Product design"],
		href: "/posts/motoparking-privacy-policy/",
		linkLabel: "運用ポリシーを見る",
	},
];

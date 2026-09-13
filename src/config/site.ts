// Public, site-specific settings. Never put CMS API keys here.
export const publication = {
	name: "つもログ",
	symbol: "つ",
	origin: "https://tumolog.com",
	tagline: "Gadgets × Indie apps",
	description:
		"PC・スマホ・バイク周辺のガジェットと、個人開発したアプリの記録を届けるブログ。",
	author: "TumoTumo",
	defaultImage: "/images/default-thumbnail.png",
	navigation: [
		{ label: "記事一覧", href: "/archive/" },
		{ label: "つくったアプリ", href: "/#works" },
		{ label: "プロフィール", href: "/about/" },
	],
	ads: {
		feed: { slot: "7990861532", layoutKey: "-6t+ed+2i-1n-4w" },
		inline: { slot: "5889839621" },
		end: { slot: "7258761611" },
	},
} as const;

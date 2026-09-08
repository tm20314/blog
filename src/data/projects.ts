import kokorahenIcon from "@assets/images/projects/kokorahen-icon.jpg";
import kokorahenScreen from "@assets/images/projects/kokorahen-mock.png";
import motoParkingIcon from "@assets/images/projects/motoparking-icon.jpg";
import motoParkingScreen from "@assets/images/projects/motoparking-mock.png";
import okariIcon from "@assets/images/projects/okari-icon.jpg";
import okariScreen from "@assets/images/projects/okari-mock.png";
import step2TheMoonIcon from "@assets/images/projects/step2themoon-icon.jpg";
import step2TheMoonScreen from "@assets/images/projects/step2themoon-mock.png";
import stepBeatIcon from "@assets/images/projects/stepbeat-icon.jpg";
import stepBeatScreen from "@assets/images/projects/stepbeat-mock.png";
import type { ImageMetadata } from "astro";

export type ProjectLink = {
	label: "App Store" | "Google Play";
	href: string;
};

export type Project = {
	name: string;
	kicker: string;
	visualTone:
		| "okari"
		| "kokorahen"
		| "stepbeat"
		| "step2themoon"
		| "motoparking";
	tagline: string;
	description: string;
	proof: string;
	stack: string[];
	icon: ImageMetadata;
	iconAlt: string;
	screen: ImageMetadata;
	screenAlt: string;
	links: ProjectLink[];
	story?: {
		href: string;
		label: string;
	};
};

export const projects: Project[] = [
	{
		name: "岡理アプリ",
		kicker: "Campus utility",
		visualTone: "okari",
		tagline: "大学生活の「どこだっけ」を、ひとつに。",
		description:
			"講義検索、大学ニュース、バス運行情報などをまとめた岡山理科大学の非公式アプリ。学生として感じた不便から企画し、公開後の改善まで個人で続けています。",
		proof: "利用者1,000人超",
		stack: ["Flutter", "Firebase", "Product design"],
		icon: okariIcon,
		iconAlt: "岡理アプリのアイコン",
		screen: okariScreen,
		screenAlt: "岡理アプリで大学情報とバス運行情報を確認する画面",
		links: [
			{
				label: "App Store",
				href: "https://apps.apple.com/jp/app/%E5%B2%A1%E7%90%86%E3%82%A2%E3%83%97%E3%83%AA/id1671546931",
			},
			{
				label: "Google Play",
				href: "https://play.google.com/store/apps/details?id=com.ous.unoffical.app&hl=ja",
			},
		],
		story: {
			href: "/posts/retention-crisis-to-1000-users/",
			label: "1,000人に届くまでを読む",
		},
	},
	{
		name: "ここらへん",
		kicker: "Nearby discovery",
		visualTone: "kokorahen",
		tagline: "開いたら、すぐ近くのお店が見つかる。",
		description:
			"現在地の周辺にある飲食店や観光スポットを、余計な操作なしで探せるアプリ。距離とジャンルで絞り込み、行き先選びを軽くします。",
		proof: "iPhone・iPad対応",
		stack: ["iOS", "Location", "Product design"],
		icon: kokorahenIcon,
		iconAlt: "ここらへんのアイコン",
		screen: kokorahenScreen,
		screenAlt: "ここらへんで周辺施設を距離順に探す画面",
		links: [
			{
				label: "App Store",
				href: "https://apps.apple.com/jp/app/%E3%81%93%E3%81%93%E3%82%89%E3%81%B8%E3%82%93/id6448917866",
			},
		],
	},
	{
		name: "StepBeat",
		kicker: "Walking × music",
		visualTone: "stepbeat",
		tagline: "歩く速さに、音楽のテンポを合わせる。",
		description:
			"歩行ペースを測り、そのテンポに合う曲をApple Musicから再生するウォーキングアプリ。歩数とワークアウトの記録にも対応しています。",
		proof: "歩速×Apple Music",
		stack: ["iOS", "Apple Music", "Health"],
		icon: stepBeatIcon,
		iconAlt: "StepBeatのアイコン",
		screen: stepBeatScreen,
		screenAlt: "StepBeatで歩くテンポと再生中の音楽を確認する画面",
		links: [
			{
				label: "App Store",
				href: "https://apps.apple.com/jp/app/stepbeat/id6789971332",
			},
		],
	},
	{
		name: "Step2TheMoon",
		kicker: "Walking record",
		visualTone: "step2themoon",
		tagline: "今日までの歩数は、世界のどこまで届いた？",
		description:
			"毎日の歩数を距離に変え、地球一周や月までの道のりと比べる歩数計。運動量ではなく、自分が積み重ねた軌跡を眺めるためのアプリです。",
		proof: "累計歩数を距離に変換",
		stack: ["iOS", "Health", "Data visualization"],
		icon: step2TheMoonIcon,
		iconAlt: "Step2TheMoonのアイコン",
		screen: step2TheMoonScreen,
		screenAlt: "Step2TheMoonで累計歩数と世界の都市までの距離を比べる画面",
		links: [
			{
				label: "App Store",
				href: "https://apps.apple.com/jp/app/step2themoon/id6796005361",
			},
		],
	},
	{
		name: "MotoParking",
		kicker: "Motorcycle utility",
		visualTone: "motoparking",
		tagline: "バイクを停められる場所だけ、サクッと探す。",
		description:
			"現在地付近の二輪車向け駐車場を一括で検索できるアプリ。排気量などの条件を確認でき、ユーザー同士で新しい駐車場情報も共有できます。",
		proof: "ユーザー投稿に対応",
		stack: ["Mobile", "Maps", "Community data"],
		icon: motoParkingIcon,
		iconAlt: "MotoParkingのアイコン",
		screen: motoParkingScreen,
		screenAlt: "MotoParkingで東京都内のバイク駐車場を地図から探す画面",
		links: [
			{
				label: "App Store",
				href: "https://apps.apple.com/jp/app/motoparking/id6783634984",
			},
		],
		story: {
			href: "/posts/motoparking-privacy-policy/",
			label: "運用ポリシーを見る",
		},
	},
];

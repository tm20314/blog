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
		tagline: "講義もバスも、大学の情報をまとめて確認。",
		description:
			"岡山理科大学の非公式アプリです。学生のときに不便だと感じたことをきっかけに作りました。講義検索や大学のニュース、バスの運行情報をまとめています。",
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
			"近くの飲食店や観光スポットを、距離やジャンルで絞り込めます。カフェや公園など、行きたい場所を現在地から探せるアプリです。",
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
			"歩くペースを測って、テンポの合う曲をApple Musicから再生します。歩数やワークアウトも記録できるウォーキングアプリです。",
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
			"これまでの歩数を距離に換算する歩数計です。世界の都市や月まであと何kmか、地球一周までどれくらいかを確認できます。",
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
		tagline: "近くのバイク駐車場を、地図で探す。",
		description:
			"現在地の近くにあるバイク駐車場を地図で探せます。停められるバイクの排気量などを確認でき、新しく見つけた駐車場の情報も投稿できます。",
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
			label: "プライバシーポリシーを見る",
		},
	},
];

export type SafeEmbed = {
	provider: "youtube" | "x" | "instagram" | "tiktok" | "vimeo";
	label: string;
	title: string;
	src: string;
	kind: "video" | "social";
	allow?: string;
	allowFullScreen?: boolean;
};

const normalizedHost = (url: URL) =>
	url.hostname.toLowerCase().replace(/^www\./u, "");

function youtubeEmbed(url: URL): SafeEmbed | null {
	const host = normalizedHost(url);
	let id = "";
	if (host === "youtu.be")
		id = url.pathname.split("/").filter(Boolean)[0] ?? "";
	if (["youtube.com", "m.youtube.com"].includes(host)) {
		id = url.searchParams.get("v") ?? "";
		if (!id)
			id =
				url.pathname.match(/^\/(?:shorts|embed|live)\/([^/?#]+)/u)?.[1] ?? "";
	}
	if (!/^[A-Za-z0-9_-]{6,15}$/u.test(id)) return null;
	return {
		provider: "youtube",
		label: "YouTube",
		title: "YouTube動画",
		src: `https://www.youtube-nocookie.com/embed/${id}?playsinline=1`,
		kind: "video",
		allow:
			"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
		allowFullScreen: true,
	};
}

function xEmbed(url: URL): SafeEmbed | null {
	const host = normalizedHost(url);
	if (!["x.com", "twitter.com", "mobile.twitter.com"].includes(host))
		return null;
	const match = url.pathname.match(/^\/([^/]+)\/status(?:es)?\/(\d+)/u);
	if (!match) return null;
	const src = new URL("https://platform.twitter.com/embed/Tweet.html");
	src.searchParams.set("id", match[2]);
	src.searchParams.set("dnt", "true");
	src.searchParams.set("theme", "light");
	return {
		provider: "x",
		label: "X",
		title: `X（@${match[1]}）の投稿`,
		src: src.toString(),
		kind: "social",
	};
}

function instagramEmbed(url: URL): SafeEmbed | null {
	const host = normalizedHost(url);
	if (!["instagram.com", "m.instagram.com"].includes(host)) return null;
	const match = url.pathname.match(/^\/(p|reel|tv)\/([A-Za-z0-9_-]+)/u);
	if (!match) return null;
	return {
		provider: "instagram",
		label: "Instagram",
		title: "Instagramの投稿",
		src: `https://www.instagram.com/${match[1]}/${match[2]}/embed/captioned/`,
		kind: "social",
	};
}

function tiktokEmbed(url: URL): SafeEmbed | null {
	const host = normalizedHost(url);
	if (!["tiktok.com", "m.tiktok.com"].includes(host)) return null;
	const id = url.pathname.match(/\/video\/(\d+)/u)?.[1] ?? "";
	if (!id) return null;
	return {
		provider: "tiktok",
		label: "TikTok",
		title: "TikTokの投稿",
		src: `https://www.tiktok.com/player/v1/${id}`,
		kind: "video",
		allow: "fullscreen",
		allowFullScreen: true,
	};
}

function vimeoEmbed(url: URL): SafeEmbed | null {
	const host = normalizedHost(url);
	if (!["vimeo.com", "player.vimeo.com"].includes(host)) return null;
	const id = url.pathname.match(/(?:video\/)?(\d+)/u)?.[1] ?? "";
	if (!id) return null;
	return {
		provider: "vimeo",
		label: "Vimeo",
		title: "Vimeo動画",
		src: `https://player.vimeo.com/video/${id}?dnt=1`,
		kind: "video",
		allow: "autoplay; fullscreen; picture-in-picture",
		allowFullScreen: true,
	};
}

export function getSafeEmbed(value: string): SafeEmbed | null {
	let url: URL;
	try {
		url = new URL(value.trim());
	} catch {
		return null;
	}
	if (url.protocol !== "https:" && url.protocol !== "http:") return null;
	return (
		youtubeEmbed(url) ??
		xEmbed(url) ??
		instagramEmbed(url) ??
		tiktokEmbed(url) ??
		vimeoEmbed(url)
	);
}

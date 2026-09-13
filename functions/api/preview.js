import { fetchMicroCMSJson } from "../../src/lib/microcms-request.mjs";

const NO_STORE_HEADERS = {
	"Cache-Control": "private, no-store, max-age=0",
	Pragma: "no-cache",
	"Referrer-Policy": "no-referrer",
	"X-Content-Type-Options": "nosniff",
	"X-Robots-Tag": "noindex, nofollow, noarchive",
};

function json(body, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			...NO_STORE_HEADERS,
			"Content-Type": "application/json; charset=utf-8",
		},
	});
}

export async function onRequestPost(context) {
	const origin = context.request.headers.get("Origin");
	if (origin && origin !== new URL(context.request.url).origin) {
		return json({ error: "このページからはプレビューを取得できません。" }, 403);
	}
	let payload;
	try {
		payload = await context.request.json();
	} catch {
		return json({ error: "プレビューURLが正しくありません。" }, 400);
	}
	const contentId =
		typeof payload?.contentId === "string" ? payload.contentId.trim() : "";
	const draftKey =
		typeof payload?.draftKey === "string" ? payload.draftKey.trim() : "";
	const serviceDomain = context.env.MICROCMS_SERVICE_DOMAIN?.trim() ?? "";
	const apiEndpoint = context.env.MICROCMS_API_ENDPOINT?.trim() || "blogs";
	const apiKey = context.env.MICROCMS_API_KEY?.trim() ?? "";

	if (
		!/^[A-Za-z0-9_-]{1,128}$/u.test(contentId) ||
		!draftKey ||
		draftKey.length > 512
	) {
		return json({ error: "プレビューURLが正しくありません。" }, 400);
	}
	if (
		!/^[a-z0-9-]+$/u.test(serviceDomain) ||
		!/^[A-Za-z0-9_-]+$/u.test(apiEndpoint) ||
		!apiKey
	) {
		return json({ error: "プレビュー機能を利用できません。" }, 503);
	}

	const upstreamUrl = new URL(
		`https://${serviceDomain}.microcms.io/api/v1/${apiEndpoint}/${encodeURIComponent(contentId)}`,
	);
	upstreamUrl.searchParams.set("draftKey", draftKey);

	try {
		const fetcher = context.data?.fetch ?? fetch;
		return json(
			await fetchMicroCMSJson(upstreamUrl, apiKey, { fetcher, retries: 1 }),
		);
	} catch (error) {
		const status = error?.status;
		return json(
			{
				error:
					status === 404
						? "プレビューする記事が見つかりません。"
						: status === 504
							? "記事の取得がタイムアウトしました。もう一度お試しください。"
							: "記事プレビューを取得できませんでした。",
			},
			status === 404 ? 404 : status === 504 ? 504 : 502,
		);
	}
}

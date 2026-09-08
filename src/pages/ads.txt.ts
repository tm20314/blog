const adsenseClientId =
	import.meta.env.PUBLIC_ADSENSE_CLIENT_ID?.trim() ?? "";
const isValidAdsenseClientId = /^ca-pub-\d+$/.test(adsenseClientId);

export const prerender = true;

export function GET() {
	const body = isValidAdsenseClientId
		? `google.com, ${adsenseClientId.replace("ca-", "")}, DIRECT, f08c47fec0942fa0\n`
		: "# Google AdSense publisher ID is not configured.\n";

	return new Response(body, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
		},
	});
}

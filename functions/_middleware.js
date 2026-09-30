const PRIMARY_HOST = "tumolog.com";
const PAGES_HOST = "tm20314-blog.pages.dev";

export async function onRequest({ request, next }) {
	const requestUrl = new URL(request.url);
	const isPagesHost =
		requestUrl.hostname === PAGES_HOST ||
		requestUrl.hostname.endsWith(`.${PAGES_HOST}`);

	if (!isPagesHost && requestUrl.hostname !== `www.${PRIMARY_HOST}`) {
		const upstream = await next();
		const response = new Response(upstream.body, upstream);
		const isEditor = /^\/editor\/?$/u.test(requestUrl.pathname);
		response.headers.set("Content-Security-Policy", `object-src 'none'; base-uri 'self'; frame-ancestors ${isEditor ? "https://tumolog.microcms.io" : "'self'"}`);
		// Roll out script restrictions in report-only mode first: ads and embeds
		// add region-dependent third-party origins. No report sends draft URLs.
		response.headers.set("Content-Security-Policy-Report-Only", "default-src 'self'; script-src 'self' https://*.googletagmanager.com https://*.googlesyndication.com https://*.google.com https://*.gstatic.com https://*.googleadservices.com https://*.doubleclick.net https://*.fundingchoicesmessages.google.com https://platform.twitter.com https://www.instagram.com; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self' data:; connect-src 'self' https:; frame-src https:; object-src 'none'; base-uri 'self'");
		response.headers.set("X-Content-Type-Options", "nosniff");
		response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
		if (requestUrl.protocol === "https:") response.headers.set("Strict-Transport-Security", "max-age=15552000");
		if (!response.headers.has("Referrer-Policy")) response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
		return response;
	}

	requestUrl.protocol = "https:";
	requestUrl.hostname = PRIMARY_HOST;
	requestUrl.port = "";
	return Response.redirect(requestUrl.toString(), 301);
}

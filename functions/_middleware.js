const PRIMARY_HOST = "tumolog.com";
const PAGES_HOST = "tm20314-blog.pages.dev";

export async function onRequest({ request, next }) {
	const requestUrl = new URL(request.url);
	const isPagesHost =
		requestUrl.hostname === PAGES_HOST ||
		requestUrl.hostname.endsWith(`.${PAGES_HOST}`);

	if (!isPagesHost) return next();

	requestUrl.protocol = "https:";
	requestUrl.hostname = PRIMARY_HOST;
	requestUrl.port = "";
	return Response.redirect(requestUrl.toString(), 301);
}

/** Shared by the build and the Cloudflare preview function. */
export async function fetchMicroCMSJson(
	url,
	apiKey,
	{
		fetcher = fetch,
		timeoutMs = 8000,
		retries = 2,
		sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
	} = {},
) {
	for (let attempt = 0; ; attempt++) {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), timeoutMs);
		let retryable = false;
		try {
			const response = await fetcher(url, {
				headers: { "X-MICROCMS-API-KEY": apiKey },
				signal: controller.signal,
				cache: "no-store",
			});
			if (!response.ok) {
				retryable = response.status === 429 || response.status >= 500;
				await response.body?.cancel();
				throw Object.assign(
					new Error(`microCMS request failed (${response.status}).`),
					{
						status: response.status,
					},
				);
			}
			return await response.json();
		} catch (error) {
			const status = error?.status;
			retryable ||= controller.signal.aborted || error instanceof TypeError;
			if (!retryable || attempt >= retries) {
				// Never propagate URLs, draft keys, headers or upstream response bodies.
				throw Object.assign(
					new Error("microCMSの記事を取得できませんでした。"),
					{
						status: status ?? (controller.signal.aborted ? 504 : 502),
					},
				);
			}
		} finally {
			clearTimeout(timer);
		}
		await sleep(250 * 2 ** attempt);
	}
}

import type {
	MicroCMSArticle,
	MicroCMSListResponse,
} from "@/types/editorial-blocks";

const serviceDomain = import.meta.env.MICROCMS_SERVICE_DOMAIN?.trim();
const apiKey = import.meta.env.MICROCMS_API_KEY?.trim();
const apiEndpoint = import.meta.env.MICROCMS_API_ENDPOINT?.trim() || "blogs";

export const isMicroCMSConfigured = Boolean(serviceDomain && apiKey);

function apiUrl(path = "", queries?: URLSearchParams) {
	if (!serviceDomain || !/^[a-z0-9-]+$/u.test(serviceDomain)) {
		throw new Error("MICROCMS_SERVICE_DOMAIN is not configured correctly.");
	}
	if (!/^[a-zA-Z0-9_-]+$/u.test(apiEndpoint)) {
		throw new Error("MICROCMS_API_ENDPOINT is not configured correctly.");
	}

	const suffix = path ? `/${encodeURIComponent(path)}` : "";
	const query = queries?.toString();
	return `https://${serviceDomain}.microcms.io/api/v1/${apiEndpoint}${suffix}${query ? `?${query}` : ""}`;
}

async function request<T>(url: string): Promise<T> {
	if (!apiKey) {
		throw new Error("MICROCMS_API_KEY is not configured.");
	}

	const response = await fetch(url, {
		headers: { "X-MICROCMS-API-KEY": apiKey },
	});
	if (!response.ok) {
		throw new Error(`microCMS request failed (${response.status}).`);
	}
	return response.json() as Promise<T>;
}

export async function getMicroCMSArticles(
	options: {
		limit?: number;
		offset?: number;
		orders?: string;
		filters?: string;
	} = {},
): Promise<MicroCMSListResponse<MicroCMSArticle>> {
	const queries = new URLSearchParams();
	for (const [key, value] of Object.entries(options)) {
		if (value !== undefined) queries.set(key, String(value));
	}
	return request(apiUrl("", queries));
}

export async function getMicroCMSArticle(contentId: string) {
	return request<MicroCMSArticle>(apiUrl(contentId));
}

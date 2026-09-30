export {};

declare global {
	interface Window {
		// Legacy template type only; public pages use ordinary document navigation.
		swup: {
			hooks: {
				on: (
					event: string,
					callback: (visit: { to: { url: string } }) => void,
					options?: { before?: boolean },
				) => void;
			};
			navigate: (url: string) => void;
		};
		pagefind: {
			search: (query: string) => Promise<{
				results: Array<{
					data: () => Promise<SearchResult>;
				}>;
			}>;
		};
	}
}

interface SearchResult {
	url: string;
	meta: {
		title: string;
	};
	excerpt: string;
	content?: string;
	word_count?: number;
	filters?: Record<string, unknown>;
	anchors?: Array<{
		element: string;
		id: string;
		text: string;
		location: number;
	}>;
	weighted_locations?: Array<{
		weight: number;
		balanced_score: number;
		location: number;
	}>;
	locations?: number[];
	raw_content?: string;
	raw_url?: string;
	sub_results?: SearchResult[];
}

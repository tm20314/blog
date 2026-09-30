type Result = { url: string; meta: { title?: string }; excerpt: string };
type Index = {
	search: (
		query: string,
	) => Promise<{ results: { data: () => Promise<Result> }[] }>;
};
declare global {
	interface Window {
		tumoLoadSearch: () => Promise<Index>;
	}
}

export function initSiteSearch() {
	const form = document.querySelector<HTMLFormElement>(".site-search");
	const input = document.querySelector<HTMLInputElement>("#search-query");
	const status = document.querySelector<HTMLElement>("[data-search-status]");
	const list = document.querySelector<HTMLOListElement>(
		"[data-search-results]",
	);
	if (!form || !input || !status || !list) return;
	let index: Promise<Index> | undefined;
	let revision = 0;
	async function search() {
		const version = ++revision;
		const query = input!.value.trim().slice(0, 200);
		const url = new URL(location.href);
		query ? url.searchParams.set("q", query) : url.searchParams.delete("q");
		history.replaceState(null, "", url);
		list!.replaceChildren();
		if (!query) {
			status!.textContent = "キーワードを入力して検索してください。";
			return;
		}
		status!.textContent = "検索しています…";
		try {
			index ??= window.tumoLoadSearch();
			const matches = await (await index).search(query);
			const results = await Promise.all(
				matches.results.slice(0, 30).map((hit) => hit.data()),
			);
			if (version !== revision) return;
			for (const result of results) {
				const target = new URL(result.url, location.origin);
				if (
					target.origin !== location.origin ||
					!target.pathname.startsWith("/posts/")
				)
					continue;
				const item = document.createElement("li");
				const heading = document.createElement("h2");
				const link = document.createElement("a");
				link.href = target.pathname + target.hash;
				link.textContent = result.meta.title || "記事を読む";
				heading.append(link);
				const excerpt = document.createElement("p");
				// Pagefind excerpts contain <mark>; render plain text, never inject HTML.
				excerpt.textContent = new DOMParser().parseFromString(
					result.excerpt,
					"text/html",
				).body.textContent;
				item.append(heading, excerpt);
				list!.append(item);
			}
			status!.textContent = list!.children.length
				? `${list!.children.length}件表示${matches.results.length > 30 ? "（上位30件）" : ""}`
				: "条件に合う記事はありません。";
		} catch (error) {
			console.warn(
				"Site search failed",
				error instanceof Error ? error.message : "Unknown error",
			);
			if (version !== revision) return;
			index = undefined;
			status!.textContent =
				"検索を読み込めませんでした。もう一度お試しください。記事一覧からも探せます。";
		}
	}
	form.addEventListener("submit", (event) => {
		event.preventDefault();
		void search();
	});
	input.value =
		new URLSearchParams(location.search).get("q")?.slice(0, 200) || "";
	if (input.value) void search();
}

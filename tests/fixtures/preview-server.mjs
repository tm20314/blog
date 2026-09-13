// Local-only browser QA: run alongside `pnpm preview --port 4325`.
// No real microCMS credentials or draft content are used.
import { createServer } from "node:http";
import { onRequestPost } from "../../functions/api/preview.js";

let attempts = 0;
const article = {
	id: "qa-article",
	slug: "qa-article",
	title: "プレビュー動作確認",
	createdAt: "2026-09-14T00:00:00Z",
	updatedAt: "2026-09-14T00:00:00Z",
	category: { name: "テスト" },
	tags: ["プレビュー"],
	content:
		'<h1>本文の見出し</h1><p>本文の途中に<span class="cms-marker-yellow">マーカー</span>を置きます。</p>',
	blocks: [
		{
			fieldId: "box",
			title: "確認ポイント",
			tone: "point",
			body: "<p>囲み装飾が表示されます。</p>",
		},
		{ fieldId: "button", label: "記事一覧へ", url: "/archive/" },
		{
			fieldId: "faq",
			question: "プレビューは公開されますか？",
			answer: "<p>このページはテスト用です。</p>",
		},
		{
			fieldId: "tabs",
			label1: "iOS",
			body1: "<p>iOSの説明</p>",
			label2: "Android",
			body2: "<p>Androidの説明</p>",
		},
	],
};

createServer(async (req, res) => {
	try {
		const url = new URL(req.url, "http://127.0.0.1:4326");
		let response;
		if (url.pathname === "/api/preview" && req.method === "POST") {
			const chunks = [];
			for await (const chunk of req) chunks.push(chunk);
			response = await onRequestPost({
				request: new Request(url, {
					method: "POST",
					headers: req.headers,
					body: Buffer.concat(chunks),
				}),
				env: {
					MICROCMS_SERVICE_DOMAIN: "example",
					MICROCMS_API_KEY: "test-only",
				},
				data: {
					fetch: async () =>
						++attempts === 1
							? new Response("test failure", { status: 401 })
							: Response.json(article),
				},
			});
		} else {
			response = await fetch(
				new URL(url.pathname + url.search, "http://127.0.0.1:4325"),
			);
		}
		res.writeHead(
			response.status,
			Object.fromEntries(
				[...response.headers].filter(
					([key]) =>
						![
							"content-encoding",
							"transfer-encoding",
							"content-length",
						].includes(key),
				),
			),
		);
		res.end(Buffer.from(await response.arrayBuffer()));
	} catch {
		res.writeHead(500);
		res.end("Local preview QA failed");
	}
}).listen(4326, "127.0.0.1", () =>
	console.log(
		"Preview fixture: http://127.0.0.1:4326/preview/#contentId=qa-article&draftKey=test-only",
	),
);

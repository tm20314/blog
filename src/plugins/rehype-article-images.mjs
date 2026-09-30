import { visit } from "unist-util-visit";
import { getRemoteImageSize } from "../lib/remote-image-size.mjs";

export function rehypeArticleImages() {
	return async (tree) => {
		const tasks = [];
		let section = "記事";
		const text = (node) =>
			node.type === "text"
				? node.value
				: (node.children ?? []).map(text).join("");
		visit(tree, "element", (node) => {
			if (/^h[2-4]$/u.test(node.tagName))
				section = text(node).replace(/#$/u, "").trim();
			if (node.tagName !== "img") return;
			node.properties ??= {};
			const props = node.properties;
			props.loading = "lazy";
			props.decoding = "async";
			// Filename-only alternatives are not useful to screen-reader users.
			if (
				/^(?:CleanShot|スクリーンショット|Screenshot).*(?:\.(?:png|jpg)|at\s\d)/iu.test(
					String(props.alt ?? ""),
				)
			)
				props.alt = `${section}の画面`;
			if (!props.width || !props.height)
				tasks.push(
					(async () => {
						const size = await getRemoteImageSize(String(props.src ?? ""));
						if (size) {
							props.width = size.width;
							props.height = size.height;
						}
					})(),
				);
		});
		await Promise.all(tasks);
	};
}

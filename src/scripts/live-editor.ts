import { Editor, generateHTML, Mark, Node as TiptapNode } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import StarterKit from "@tiptap/starter-kit";
import { type CMSRawBlock, isLiveBody, type LiveBody } from "../utils/cms-body";
import { filterCMSRichTextClasses } from "../utils/cms-rich-text";
import { renderBlock, sanitizeRichText } from "./microcms-preview";

const CMS_ORIGIN = "https://tumolog.microcms.io";
const Decoration = Mark.create({
	name: "decoration",
	addAttributes: () => ({ class: { default: "" } }),
	parseHTML: () => [
		{
			tag: "span[class]",
			getAttrs: (node) => {
				const names = filterCMSRichTextClasses(
					node.getAttribute("class") ?? "",
				);
				return names.length ? { class: names.join(" ") } : false;
			},
		},
	],
	renderHTML: ({ HTMLAttributes }) => ["span", HTMLAttributes, 0],
});
const Product = TiptapNode.create({
	name: "product",
	group: "block",
	atom: true,
	selectable: true,
	addAttributes: () => ({ block: { default: {}, rendered: false } }),
	parseHTML: () => [],
	renderHTML: ({ node }) => [
		"div",
		{ "data-product": "", contenteditable: "false" },
		`商品ボックス：${String(node.attrs.block.name || "商品名未入力")}`,
	],
});

function httpUrl(value: FormDataEntryValue | null): string {
	const text = String(value || "").trim();
	if (!text) return "";
	const url = new URL(text);
	if (url.protocol !== "https:" && url.protocol !== "http:")
		throw new Error("URLはhttps://またはhttp://で入力してください。");
	return url.href;
}

export function initLiveEditor() {
	const root = document.querySelector<HTMLElement>("[data-live-editor]");
	if (!root) return;
	const get = <T extends HTMLElement>(selector: string): T => {
		const element = root.querySelector<T>(selector);
		if (!element) throw new Error(`Missing editor element: ${selector}`);
		return element;
	};
	const commandButtons =
		root.querySelectorAll<HTMLButtonElement>("[data-command]");
	const status = get<HTMLElement>("[data-connection]");
	const controls = get<HTMLFieldSetElement>("[data-controls]");
	const enabled = get<HTMLInputElement>("[data-enabled]");
	const preview = get<HTMLElement>("[data-live-preview]");
	const productForm = get<HTMLFormElement>("[data-product-form]");
	let fieldId = "";
	let initialized = false;
	let changed = false;
	let renderTimer = 0;
	const standalone = window.parent === window;
	const extensions = [
		StarterKit.configure({
			heading: { levels: [2, 3, 4] },
			link: { openOnClick: false, defaultProtocol: "https" },
		}),
		Image,
		TableKit,
		Decoration,
		Product,
	];
	const editor = new Editor({
		element: get("[data-editor]"),
		extensions,
		editable: false,
		content: "<p></p>",
		editorProps: {
			attributes: {
				"aria-label": "記事本文",
				role: "textbox",
				"aria-multiline": "true",
			},
		},
		onUpdate: () => update(),
		onSelectionUpdate: () => updateSelection(),
	});
	function blocks(): CMSRawBlock[] {
		const result: CMSRawBlock[] = [];
		let textNodes: NonNullable<ReturnType<typeof editor.getJSON>["content"]> =
			[];
		const flush = () => {
			if (textNodes.length)
				result.push({
					fieldId: "richText",
					body: generateHTML({ type: "doc", content: textNodes }, extensions),
				});
			textNodes = [];
		};
		for (const node of editor.getJSON().content ?? []) {
			if (node.type === "product") {
				flush();
				result.push({ ...node.attrs?.block, fieldId: "product" });
			} else textNodes.push(node);
		}
		flush();
		return result;
	}
	function render() {
		preview.replaceChildren(
			...blocks()
				.map(renderBlock)
				.filter((node): node is HTMLElement => Boolean(node)),
		);
	}
	function send(data: LiveBody) {
		if (!fieldId) return;
		window.parent.postMessage(
			{
				id: fieldId,
				action: "MICROCMS_POST_DATA",
				message: {
					title: data.enabled
						? "リアルタイム本文（使用中）"
						: "リアルタイム本文（未使用）",
					data,
				},
			},
			CMS_ORIGIN,
		);
	}
	function update() {
		if (!initialized) return;
		changed = true;
		send({ version: 1, enabled: enabled.checked, blocks: blocks() });
		status.textContent = standalone
			? "お試しモード：変更は保存されません。"
			: "入力を反映中です。確定保存はmicroCMSの「下書きを保存」で行ってください。";
		clearTimeout(renderTimer);
		renderTimer = window.setTimeout(render, 150);
	}
	function updateSelection() {
		for (const button of commandButtons) {
			const names: Record<string, string> = {
				bold: "bold",
				italic: "italic",
				bullet: "bulletList",
				quote: "blockquote",
			};
			const name = names[button.dataset.command ?? ""];
			if (name)
				button.setAttribute("aria-pressed", String(editor.isActive(name)));
		}
		const selected = editor.isActive("product");
		get<HTMLButtonElement>("[data-product-submit]").textContent = selected
			? "選択した商品を更新"
			: "カーソル位置に挿入";
		if (selected) {
			const block = editor.getAttributes("product").block;
			for (const key of [
				"name",
				"summary",
				"amazonUrl",
				"rakutenUrl",
				"officialUrl",
				"imageUrl",
			]) {
				const input = productForm.elements.namedItem(key) as HTMLInputElement;
				input.value = String(
					key === "imageUrl" ? block.image?.url || "" : block[key] || "",
				);
			}
		}
	}
	window.addEventListener("message", (event) => {
		if (
			event.origin !== CMS_ORIGIN ||
			event.source !== window.parent ||
			!event.data ||
			typeof event.data.id !== "string"
		)
			return;
		const message = event.data;
		if (message.action === "MICROCMS_GET_DEFAULT_DATA" && !initialized) {
			const data: unknown = message.message?.data;
			if (data != null && !isLiveBody(data)) {
				status.textContent =
					"未対応のデータ形式です。上書きを防ぐため編集を停止しました。";
				return;
			}
			fieldId = message.id;
			if (isLiveBody(data)) {
				const content = data.blocks.flatMap((block) => {
					if (block.fieldId === "product")
						return [{ type: "product", attrs: { block } }];
					// Parse rich text through the same schema, without changing legacy CMS fields.
					const temporary = new Editor({
						extensions,
						content: sanitizeRichText(block.body),
					});
					const nodes = temporary.getJSON().content ?? [];
					temporary.destroy();
					return nodes;
				});
				editor.commands.setContent(
					{
						type: "doc",
						content: content.length ? content : [{ type: "paragraph" }],
					},
					{ emitUpdate: false },
				);
				enabled.checked = data.enabled;
			}
			initialized = true;
			controls.disabled = false;
			enabled.disabled = false;
			editor.setEditable(true);
			status.textContent = "接続しました。入力中の本文をプレビューできます。";
			render();
			window.parent.postMessage(
				{
					id: fieldId,
					action: "MICROCMS_UPDATE_STYLE",
					message: { height: 1000, width: "100%" },
				},
				CMS_ORIGIN,
			);
		}
		if (message.id !== fieldId) return;
		if (message.action === "MICROCMS_POST_DATA_SUCCESS" && changed)
			status.textContent =
				"microCMSの入力欄に反映しました。保存できているかはmicroCMS側で確認してください。";
		if (message.action === "MICROCMS_POST_DATA_FAILURE")
			status.textContent =
				"microCMSに入力を反映できませんでした。この画面を閉じず、本文をコピーして保管してください。";
	});
	if (standalone) {
		initialized = true;
		controls.disabled = false;
		enabled.disabled = false;
		editor.setEditable(true);
		status.textContent =
			"お試しモード：変更は保存されません。実際の執筆はmicroCMSの拡張フィールドから開いてください。";
		render();
	}
	enabled.addEventListener("change", update);
	get<HTMLSelectElement>("[data-view]").addEventListener("change", (event) => {
		get("[data-panes]").dataset.view = (
			event.target as HTMLSelectElement
		).value;
	});
	root
		.querySelectorAll<HTMLButtonElement>("[data-command]")
		.forEach((button) => {
			button.addEventListener("click", () => {
				const chain = editor.chain().focus();
				switch (button.dataset.command) {
					case "bold":
						chain.toggleBold().run();
						break;
					case "italic":
						chain.toggleItalic().run();
						break;
					case "h2":
						chain.toggleHeading({ level: 2 }).run();
						break;
					case "h3":
						chain.toggleHeading({ level: 3 }).run();
						break;
					case "bullet":
						chain.toggleBulletList().run();
						break;
					case "quote":
						chain.toggleBlockquote().run();
						break;
					case "undo":
						chain.undo().run();
						break;
					case "redo":
						chain.redo().run();
						break;
					case "table":
						chain.insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
						break;
					case "row":
						chain.addRowAfter().run();
						break;
					case "column":
						chain.addColumnAfter().run();
						break;
				}
				updateSelection();
			});
		});
	get<HTMLSelectElement>("[data-decoration]").addEventListener(
		"change",
		(event) => {
			const value = (event.target as HTMLSelectElement).value;
			if (value)
				editor.chain().focus().setMark("decoration", { class: value }).run();
			else editor.chain().focus().unsetMark("decoration").run();
		},
	);
	for (const kind of ["link", "image"] as const)
		get<HTMLFormElement>(`[data-${kind}-form]`).addEventListener(
			"submit",
			(event) => {
				event.preventDefault();
				const data = new FormData(event.currentTarget as HTMLFormElement);
				try {
					const url = httpUrl(data.get("url"));
					if (kind === "link")
						editor
							.chain()
							.focus()
							.extendMarkRange("link")
							.setLink({ href: url })
							.run();
					else
						editor
							.chain()
							.focus()
							.setImage({ src: url, alt: String(data.get("alt") || "") })
							.run();
				} catch {
					status.textContent = "URLはhttps://またはhttp://で入力してください。";
				}
			},
		);
	productForm.addEventListener("submit", (event) => {
		event.preventDefault();
		const error = get<HTMLElement>("[data-product-error]");
		error.textContent = "";
		try {
			const data = new FormData(productForm);
			const imageUrl = httpUrl(data.get("imageUrl"));
			const block = {
				fieldId: "product",
				name: String(data.get("name") || "").trim(),
				summary: String(data.get("summary") || ""),
				amazonUrl: httpUrl(data.get("amazonUrl")),
				rakutenUrl: httpUrl(data.get("rakutenUrl")),
				officialUrl: httpUrl(data.get("officialUrl")),
				...(imageUrl ? { image: { url: imageUrl } } : {}),
			};
			if (!block.name) throw new Error("商品名を入力してください。");
			if (!block.amazonUrl && !block.rakutenUrl && !block.officialUrl)
				throw new Error("商品へのリンクを1つ以上入力してください。");
			if (editor.isActive("product"))
				editor.chain().focus().updateAttributes("product", { block }).run();
			else
				editor
					.chain()
					.focus()
					.insertContent([
						{ type: "product", attrs: { block } },
						{ type: "paragraph" },
					])
					.run();
			get<HTMLDetailsElement>("[data-product-panel]").open = false;
		} catch (cause) {
			error.textContent =
				cause instanceof Error ? cause.message : "入力内容を確認してください。";
		}
	});
}

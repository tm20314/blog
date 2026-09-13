const initialized = new WeakSet<Document | HTMLElement>();

/** The published article and draft preview share the same tab interaction. */
export function initEditorialTabs(root: Document | HTMLElement = document) {
	if (initialized.has(root)) return;
	initialized.add(root);
	const tabButton = (event: Event) =>
		event.target instanceof Element
			? event.target.closest<HTMLButtonElement>(
					"[data-editor-tabs] [role='tab']",
				)
			: null;
	const buttonsFor = (button: HTMLButtonElement) => {
		const group = button.closest("[data-editor-tabs]");
		return [
			...(group?.querySelectorAll<HTMLButtonElement>("[role='tab']") ?? []),
		].filter((candidate) => candidate.closest("[data-editor-tabs]") === group);
	};
	const activate = (button: HTMLButtonElement) => {
		const group = button.closest("[data-editor-tabs]");
		for (const candidate of buttonsFor(button)) {
			const active = candidate === button;
			candidate.setAttribute("aria-selected", String(active));
			candidate.tabIndex = active ? 0 : -1;
			const panelId = candidate.getAttribute("aria-controls");
			const panel = panelId
				? group?.querySelector<HTMLElement>(`#${CSS.escape(panelId)}`)
				: null;
			if (panel) panel.hidden = !active;
		}
	};
	root.addEventListener("click", (event) => {
		const button = tabButton(event);
		if (button) activate(button);
	});
	root.addEventListener("keydown", (rawEvent) => {
		const event = rawEvent as KeyboardEvent;
		const button = tabButton(event);
		if (
			!button ||
			!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
		)
			return;
		const buttons = buttonsFor(button);
		if (!buttons.length) return;
		event.preventDefault();
		const index = buttons.indexOf(button);
		const next =
			event.key === "Home"
				? buttons[0]
				: event.key === "End"
					? buttons.at(-1)
					: buttons[
							(index + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) %
								buttons.length
						];
		if (next) {
			activate(next);
			next.focus();
		}
	});
}

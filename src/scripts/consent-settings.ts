declare global {
	interface Window {
		tumoSetAnalyticsConsent?: (allowed: boolean) => void;
		googlefc?: { showRevocationMessage?: () => void };
	}
}
export const CONSENT_STORAGE_KEY = "tumolog.analytics-consent.v1";
export function readAnalyticsConsent(
	storage: Pick<Storage, "getItem">,
	now = Date.now(),
): boolean | null {
	try {
		const saved = JSON.parse(storage.getItem(CONSENT_STORAGE_KEY) || "null");
		return typeof saved?.allowed === "boolean" &&
			Number.isFinite(saved.expires) &&
			saved.expires > now
			? saved.allowed
			: null;
	} catch {
		return null;
	}
}
export function initConsentSettings() {
	const settings = document.querySelector<HTMLDetailsElement>(
		"[data-consent-settings]",
	);
	const status = settings?.querySelector<HTMLElement>("[data-consent-status]");
	if (!settings || !status) return;
	let selected: boolean | null = null;
	try {
		selected = readAnalyticsConsent(localStorage);
	} catch {
		/* Stay denied. */
	}
	const updateStatus = (allowed: boolean | null) => {
		status.textContent =
			allowed === true
				? "現在：解析を許可しています。"
				: "現在：解析を許可していません。";
	};
	updateStatus(selected);
	settings.open = selected === null;
	function choose(allowed: boolean) {
		let stored = true;
		try {
			localStorage.setItem(
				CONSENT_STORAGE_KEY,
				JSON.stringify({
					allowed,
					expires: Date.now() + 180 * 24 * 60 * 60 * 1000,
				}),
			);
		} catch {
			stored = false;
		}
		window.tumoSetAnalyticsConsent?.(allowed);
		updateStatus(allowed);
		if (!stored)
			status!.textContent +=
				" ブラウザーが保存を許可していないため、このページだけに適用します。";
	}
	settings
		.querySelector("[data-analytics-allow]")
		?.addEventListener("click", () => choose(true));
	settings
		.querySelector("[data-analytics-deny]")
		?.addEventListener("click", () => choose(false));
	settings
		.querySelector("[data-ad-privacy-settings]")
		?.addEventListener("click", () => {
			if (typeof window.googlefc?.showRevocationMessage === "function")
				window.googlefc.showRevocationMessage();
			else
				status.textContent =
					"この地域では広告の同意画面を表示できません。Googleの広告設定とプライバシーポリシーをご確認ください。";
		});
}

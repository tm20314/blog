/** JSON embedded in a script must not contain an HTML closing-script token. */
export function serializeJsonLd(value: unknown): string {
	return JSON.stringify(value).replace(/</g, "\\u003c");
}

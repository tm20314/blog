export const MAX_PREVIEW_BYTES = 4096;

// Bounded per-isolate fallback. Use a Cloudflare WAF rule for edge-wide limits.
export function createPreviewLimiter({ limit = 30, interval = 60_000, capacity = 2000, now = Date.now } = {}) {
	const buckets = new Map();
	return (key) => {
		const time = now();
		for (const [id, bucket] of buckets) if (bucket.until <= time) buckets.delete(id);
		let bucket = buckets.get(key);
		if (!bucket) {
			if (buckets.size >= capacity) return false;
			bucket = { count: 0, until: time + interval };
			buckets.set(key, bucket);
		}
		return ++bucket.count <= limit;
	};
}

export async function readPreviewPayload(request) {
	const declared = Number(request.headers.get("Content-Length"));
	if (declared > MAX_PREVIEW_BYTES) throw new RangeError("Payload too large");
	const reader = request.body?.getReader();
	if (!reader) throw new SyntaxError("Missing body");
	const chunks = [];
	let size = 0;
	try {
		while (true) {
			const { value, done } = await reader.read();
			if (done) break;
			size += value.byteLength;
			if (size > MAX_PREVIEW_BYTES) {
				await reader.cancel();
				throw new RangeError("Payload too large");
			}
			chunks.push(value);
		}
	} finally { reader.releaseLock(); }
	const bytes = new Uint8Array(size);
	let offset = 0;
	for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
	return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
}

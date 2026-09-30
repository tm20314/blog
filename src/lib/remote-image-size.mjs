import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const pending = new Map();
let active = 0;
const queue = [];
const cacheDir = path.resolve("node_modules/.cache/tumolog-image-sizes");
const imageRequests = new Map();
export function readTrustedImage(value) {
	if (!isTrustedArticleImage(value)) return Promise.resolve(null);
	if (!imageRequests.has(value))
		imageRequests.set(value, readTrustedImageOnce(value));
	return imageRequests.get(value);
}
async function readTrustedImageOnce(value) {
	if (!isTrustedArticleImage(value)) return null;
	try {
		const response = await fetch(value, {
			signal: AbortSignal.timeout(6000),
			redirect: "error",
		});
		if (
			!response.ok ||
			Number(response.headers.get("content-length")) > 8 * 1024 * 1024
		)
			return null;
		const reader = response.body?.getReader();
		if (!reader) return null;
		const chunks = [];
		let bytes = 0;
		try {
			while (true) {
				const { done, value: chunk } = await reader.read();
				if (done) break;
				bytes += chunk.byteLength;
				if (bytes > 8 * 1024 * 1024) {
					await reader.cancel();
					return null;
				}
				chunks.push(chunk);
			}
		} finally {
			reader.releaseLock();
		}
		return Buffer.concat(chunks);
	} catch {
		return null;
	}
}
export function isTrustedArticleImage(value) {
	try {
		const url = new URL(value);
		return (
			url.protocol === "https:" &&
			!url.username &&
			!url.password &&
			!url.port &&
			(url.hostname === "qiita-image-store.s3.ap-northeast-1.amazonaws.com" ||
				url.hostname === "images.microcms-assets.io" ||
				(url.hostname === "storage.googleapis.com" &&
					url.pathname.startsWith("/zenn-user-upload/")))
		);
	} catch {
		return false;
	}
}
async function inspect(value) {
	const cachePath = path.join(
		cacheDir,
		`${createHash("sha256").update(value).digest("hex")}.json`,
	);
	try {
		const cached = JSON.parse(await readFile(cachePath, "utf8"));
		if (
			Number.isInteger(cached.width) &&
			Number.isInteger(cached.height) &&
			cached.width > 0 &&
			cached.height > 0 &&
			Date.now() - cached.saved < 30 * 86400_000
		)
			return cached;
	} catch {
		/* Cache miss. */
	}
	if (active >= 4) await new Promise((resolve) => queue.push(resolve));
	active++;
	try {
		const bytes = await readTrustedImage(value);
		if (!bytes) return null;
		const { width, height } = await sharp(bytes, {
			limitInputPixels: 40_000_000,
		}).metadata();
		if (!width || !height) return null;
		const result = { width, height, saved: Date.now() };
		try {
			await mkdir(cacheDir, { recursive: true });
			await writeFile(cachePath, JSON.stringify(result));
		} catch {
			/* Optional cache. */
		}
		return result;
	} catch {
		return null;
	} finally {
		active--;
		queue.shift()?.();
	}
}
export function getRemoteImageSize(value) {
	if (!isTrustedArticleImage(value)) return Promise.resolve(null);
	if (!pending.has(value)) pending.set(value, inspect(value));
	return pending.get(value);
}

import assert from "node:assert/strict";
import test from "node:test";
import { fetchMicroCMSJson } from "../src/lib/microcms-request.mjs";

test("transient errors retry, preserving authentication and no-store", async () => {
	let calls = 0;
	const waits = [];
	const result = await fetchMicroCMSJson(
		"https://example.microcms.io/api/v1/blogs",
		"secret",
		{
			fetcher: async (_url, options) => {
				assert.equal(options.headers["X-MICROCMS-API-KEY"], "secret");
				assert.equal(options.cache, "no-store");
				calls++;
				return calls < 3
					? new Response("busy", { status: calls === 1 ? 429 : 503 })
					: Response.json({ contents: [] });
			},
			sleep: async (delay) => {
				waits.push(delay);
			},
		},
	);
	assert.deepEqual(result, { contents: [] });
	assert.deepEqual(waits, [250, 500]);
});

test("authentication errors are not retried or exposed", async () => {
	let calls = 0;
	await assert.rejects(
		fetchMicroCMSJson("https://example.test/?draftKey=secret", "secret", {
			fetcher: async () => {
				calls++;
				return new Response("secret", { status: 401 });
			},
		}),
		(error) => {
			assert.equal(error.status, 401);
			assert.doesNotMatch(error.message, /secret|example/);
			return true;
		},
	);
	assert.equal(calls, 1);
});

test("network failures stop after the retry budget", async () => {
	let calls = 0;
	await assert.rejects(
		fetchMicroCMSJson("https://example.test", "secret", {
			fetcher: async () => {
				calls++;
				throw new TypeError("private upstream URL");
			},
			sleep: async () => {},
		}),
		(error) => error.status === 502 && !error.message.includes("private"),
	);
	assert.equal(calls, 3);
});

test("an aborted fetch ends with a timeout, without waiting forever", async () => {
	await assert.rejects(
		fetchMicroCMSJson("https://example.test", "secret", {
			timeoutMs: 10,
			retries: 0,
			fetcher: async (_url, { signal }) =>
				new Promise((_, reject) => {
					signal.addEventListener("abort", () =>
						reject(new DOMException("Aborted", "AbortError")),
					);
				}),
		}),
		(error) => error.status === 504,
	);
});

test("malformed JSON is not accepted as a successful response", async () => {
	await assert.rejects(
		fetchMicroCMSJson("https://example.test", "secret", {
			fetcher: async () => new Response("not-json secret"),
		}),
		(error) => error.status === 502 && !error.message.includes("secret"),
	);
});

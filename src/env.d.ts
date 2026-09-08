/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
	readonly MICROCMS_SERVICE_DOMAIN?: string;
	readonly MICROCMS_API_KEY?: string;
	readonly MICROCMS_API_ENDPOINT?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

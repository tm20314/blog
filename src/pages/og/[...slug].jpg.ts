import type { APIContext } from "astro";
import sharp from "sharp";
import {
	isTrustedArticleImage,
	readTrustedImage,
} from "../../lib/remote-image-size.mjs";
import { getSortedPosts } from "../../utils/content-utils";
import { representativeImage } from "../../utils/representative-image";

export async function getStaticPaths() {
	const routes = await Promise.all(
		(await getSortedPosts()).map(async (post) => {
			const image = representativeImage(post);
			if (!isTrustedArticleImage(image)) return [];
			if (!(await readTrustedImage(image))) {
				console.warn(
					`[OG] ${post.slug}: 画像を取得できないため記事用OG画像を省略します。`,
				);
				return [];
			}
			return [{ params: { slug: post.slug }, props: { image } }];
		}),
	);
	return routes.flat();
}
export async function GET({ props }: APIContext) {
	const image = await readTrustedImage(props.image);
	// Do not silently advertise a brand placeholder as an article's actual image.
	// A transient upstream failure should keep the previous deployment intact.
	if (!image)
		throw new Error(
			"記事のOG画像を取得できません。画像配信元を確認してビルドを再実行してください。",
		);
	const output = await sharp(image, { limitInputPixels: 40_000_000 })
		.rotate()
		.resize(1200, 630, { fit: "contain", background: "#ffffff" })
		.jpeg({ quality: 80, mozjpeg: true })
		.toBuffer();
	return new Response(new Uint8Array(output), {
		headers: { "Content-Type": "image/jpeg" },
	});
}

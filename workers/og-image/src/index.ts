/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const targetUrl = url.searchParams.get('url');

		if (!targetUrl) {
			return new Response('URL parameter is missing', { status: 400 });
		}

		try {
			const pageResponse = await fetch(targetUrl);
			const pageHtml = await pageResponse.text();
			const ogImageUrl = extractOgImage(pageHtml);

			if (!ogImageUrl) {
				return new Response('OGP image not found', { status: 404 });
			}

			const imageResponse = await fetch(ogImageUrl);
			const contentType = imageResponse.headers.get('Content-Type') || 'application/octet-stream';
			return new Response(imageResponse.body, {
				headers: {
					'Content-Type': contentType,
					'Cache-Control': 'max-age=604800',
				},
			});
		} catch (error) {
			return new Response('Error fetching OGP image', { status: 500 });
		}
	},
};

function extractOgImage(html: string): string | null {
	const regex = /<meta property="og:image" content="(.*?)"/;
	const match = regex.exec(html);
	return match ? match[1] : null;
}

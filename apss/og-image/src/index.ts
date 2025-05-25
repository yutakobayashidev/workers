class OGPParser {
	ogpTitle: string;
	ogpDescription: string;
	ogpImageUrl: string;
	ogpSiteName: string;

	constructor() {
		this.ogpTitle = "";
		this.ogpDescription = "";
		this.ogpImageUrl = "";
		this.ogpSiteName = "";
	}
	element(element: Element) {
		switch (element.getAttribute("property")) {
			case "og:title":
				this.ogpTitle = element.getAttribute("content") ?? "";
				break;
			case "og:description":
				this.ogpDescription = element.getAttribute("content") ?? "";
				break;
			case "og:image":
				this.ogpImageUrl = element.getAttribute("content") ?? "";
				break;
			case "og:site_name":
				this.ogpSiteName = element.getAttribute("content") ?? "";
				break;
			default:
				break;
		}
	}
}

export default {
	async fetch(request: Request): Promise<Response> {

		const url = new URL(request.url);

		const targetUrl = url.searchParams.get('url');

		if (!targetUrl) {
			return new Response('URL parameter is missing', { status: 400 });
		}

		const decodedHref = decodeURIComponent(targetUrl);
		const siteRes = await fetch(decodedHref);

		const ogp = new OGPParser();
		const rewriter = new HTMLRewriter().on("meta", ogp);
		await rewriter.transform(siteRes).text();

		if (!ogp.ogpImageUrl) {
			return new Response('OGP image not found', { status: 404 });
		}

		const imageResponse = await fetch(ogp.ogpImageUrl);
		const contentType = imageResponse.headers.get('Content-Type') || 'application/octet-stream';
		return new Response(imageResponse.body, {
			headers: {
				'Content-Type': contentType,
				'Cache-Control': 'max-age=604800',
			},
		});
	},
}

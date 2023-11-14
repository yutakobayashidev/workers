addEventListener('fetch', (event) => {
	event.respondWith(handleRequest(event.request));
});

async function handleRequest(request: Request) {
	try {
		const url = new URL(request.url);

		if (url.pathname.startsWith('/redirect/')) {
			// Extract the target URL from the path
			let targetUrl = url.pathname.slice(10);

			// Preserve query parameters
			if (url.search) {
				targetUrl += url.search;
			}

			// Redirect to the specified URL
			return Response.redirect(targetUrl, 302);
		}

		if (url.pathname === '/') {
			return new Response(`
        Usage:\n
          ${url.origin}/<url>
      `);
		}

		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 200,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Authorization, Content-Type, Notion-Version',
				},
			});
		}

		const headers = new Headers(request.headers);

		if ('api.notion.com' === new URL(request.url.slice(url.origin.length + 1)).hostname && !headers.has('Notion-Version')) {
			const notionVersion = '2021-05-13';
			headers.set('Notion-Version', notionVersion);
		}

		let response = await fetch(request.url.slice(url.origin.length + 1), {
			method: request.method,
			headers: headers,
			redirect: 'follow',
			body: request.body,
		});
		response = new Response(response.body, response);
		response.headers.set('Access-Control-Allow-Origin', '*');
		response.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS');
		response.headers.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Accept, Authorization, Content-Type, Notion-Version');

		return response;
	} catch (e: any) {
		return new Response(e.stack || e, { status: 500 });
	}
}

# workers

[Cloudflare Workers](https://workers.cloudflare.com/) collection for me using the pnpm workspace.

## core

Core API endpoints and services at https://api.yutakobayashi.dev.

This module provides various integrations and services including:
- Bluesky/AT Protocol integration
- Discord bot functionality
- Notion integration
- Email processing
- QR code generation
- And more

Built with:
- Cloudflare Workers
- Hono (Web framework)
- TypeScript

For detailed setup and development instructions, see [core/README.md](./apss/core/README.md).

## reverse-proxy

Reverse proxy to avoid CORS errors.

When using this reverse proxy on `api.notion.com`, `Notion-Version` is automatically plugged into the headers.

```
https://reverse-proxy.yutakobayashi.workers.dev/<url>
```

## og-image

Parse `og:image` in `head` from url and return image from url.

```
https://og-image.yutakobayashi.workers.dev?url=<url>
```

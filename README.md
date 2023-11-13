# workers

[Cloudflare Workers](https://workers.cloudflare.com/) collection for me using the pnpm workspace.

## reverse-proxy

Reverse proxy to avoid CORS errors.

When using this reverse proxy on `api.notion.com`, `Notion-Version` is automatically plugged into the headers.

```
https://reverse-proxy.yutakobayashi.workers.dev/<url>
```

import { createMiddleware } from "hono/factory";
import type { HonoConfig } from "@/config";
import { Client } from "@notionhq/client";
import { DiscordClient } from "@/clients/discord";
import { BlueskyClient } from "@/clients/bluesky";

export const inject = createMiddleware<HonoConfig>(async (c, next) => {

	if (!c.get("discord")) {
		const client = new DiscordClient(
			c.env.DISCORD_TOKEN,
			c.env.DISCORD_APPLICATION_ID,
		);

		c.set("discord", client);
	}

	if (!c.get("bluesky")) {
		const client = new BlueskyClient(
			c.env.BLUESKY_IDENTIFIER,
			c.env.BLUESKY_PASSWORD,
		);
		c.set("bluesky", client);
	}

	if (!c.get("internal")) {
		const internal = {
			notion: c.get("notion"),
			discord: c.get("discord"),
			bluesky: c.get("bluesky"),
			kv: c.env.YUTA_STUDIO,
			env: {
				DISCORD_DEVELOPER_USER_ID: c.env.DISCORD_DEVELOPER_USER_ID,
			},
		};
		c.set("internal", internal);
	}
	await next();
});

import type { Client } from "@notionhq/client";
import type { DiscordClient } from "./clients/discord";
import type { BlueskyClient } from "./clients/bluesky";

export type InternalContext = {
	notion: Client;
	discord: DiscordClient;
	bluesky: BlueskyClient;
	kv: KVNamespace;
	env: {
		DISCORD_DEVELOPER_USER_ID: string;
	};
};

export interface HonoConfig {
	Bindings: {
		DISCORD_TOKEN: string;
		SLACK_TOKEN: string;
		OPENAI_API_KEY: string;
		DISCORD_APPLICATION_ID: string;
		FORWARD_EMAIL: string;
		BLUESKY_IDENTIFIER: string;
		BLUESKY_PASSWORD: string;
		CHANNEL_ID: string;
		DISCORD_PUBLIC_KEY: string;
		NOTION_INBOX_DATABASE_ID: string;
		DISCORD_WEBHOOK_URL: string;
		DEEPL_API_KEY: string;
		SPOTIFY_CLIENT_ID: string;
		SPOTIFY_CLIENT_SECRET: string;
		SPOTIFY_REFRESH_TOKEN: string;
		NOTION_TOKEN: string;
		NOTION_DATABASE_ID: string;
		WAKATIME_API_KEY: string;
		DISCORD_DOODLE_CHANNEL_ID: string;
		DISCORD_NNN_CHANNEL_ID: string;
		DISCORD_GUILD_ID: string;
		DISCORD_DEVELOPER_USER_ID: string;
		SLACK_NNN_CHANNEL_ID: string;
		YUTA_STUDIO: KVNamespace;
	};
	Variables: {
		notion: Client;
		discord: DiscordClient;
		bluesky: BlueskyClient;
		internal: InternalContext;
	};
}

import type { HonoConfig } from "@/config";
import { Hono } from "hono";
import { InteractionType } from "discord-interactions";
import { verifyDiscordInteraction } from "@/middleware/verifyDiscordInteraction";
import { errorResponse } from "@/services/discord/responses/errorResponse";
import { handleApplicationCommands } from "@/interactions/handleApplicationCommands";
import dlsiteCommand from "@/interactions/applicationCommands/dlsite";
import registerCommand from "@/interactions/applicationCommands/register";
import inviteCommand from "@/interactions/applicationCommands/invite";
import blueskyCommand from "@/interactions/applicationCommands/bluesky";
import ethCommand from "@/interactions/applicationCommands/eth";
import keyoxideCommand from "@/interactions/applicationCommands/keyoxide";
import optoutCommand from "@/interactions/applicationCommands/optout";

const app = new Hono<HonoConfig>();

app.post("/interaction", verifyDiscordInteraction, async (c) => {
	const body = await c.req.json();

	try {
		switch (body.type) {
			case InteractionType.APPLICATION_COMMAND:
				return c.json(
					await handleApplicationCommands({
						intentObj: body,
						ctx: c.get("internal"),
						commands: [
							dlsiteCommand,
							registerCommand,
							inviteCommand,
							blueskyCommand,
							ethCommand,
							keyoxideCommand,
							optoutCommand,
						],
					}),
				);
		}
	} catch (e) {
		console.error(e);
		return c.json(
			errorResponse(
				e instanceof Error ? e.message : "Something seems to have gone wrong!",
			),
		);
	}
});

app.get("/commands", async (c) => {
	const token = c.env.DISCORD_TOKEN;
	const applicationId = c.env.DISCORD_APPLICATION_ID;
	const url = `https://discord.com/api/v10/applications/${applicationId}/commands`;

	const response = await fetch(url, {
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bot ${token}`,
		},
		method: "GET",
	});

	return c.json(await response.json());
});

app.get("/icons", async (c) => {
	const token = c.env.DISCORD_TOKEN;
	const guildId = "895564066922328094";

	const response = await fetch(
		"https://discord.com/api/v10/guilds/895564066922328094",
		{
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bot ${token}`,
			},
			method: "GET",
		},
	);

	const responseData = await response.json();
	const iconHash = (responseData as { icon: string }).icon;
	const iconUrl = iconHash
		? `https://cdn.discordapp.com/icons/${guildId}/${iconHash}.png`
		: null;

	if (!iconUrl) {
		return c.json({ message: "No icon found" });
	}

	const response2 = await fetch(iconUrl, {
		headers: {
			"Content-Type": "image/png",
		},
		method: "GET",
	});

	return new Response(await response2.arrayBuffer(), {
		headers: {
			"Content-Type": "image/png",
		},
	});
});

app.get("/", async (c) => {
	const token = c.env.DISCORD_TOKEN;

	const response = await fetch(
		"https://discord.com/api/v10/guilds/895564066922328094",
		{
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bot ${token}`,
			},
			method: "GET",
		},
	);

	return c.json(await response.json());
});

export default app;

import { HonoConfig } from "@/config";
import { Hono } from "hono";
import { InteractionType } from "discord-interactions";
import { verifyDiscordInteraction } from "@/middleware/verifyDiscordInteraction";
import { errorResponse } from "@/services/discord/responses/errorResponse";
import { handleApplicationCommands } from "@/interactions/handleApplicationCommands";
import dlsiteCommand from "@/interactions/applicationCommands/dlsite";
import registerCommand from "@/interactions/applicationCommands/register";
import inviteCommand from "@/interactions/applicationCommands/invite";
import blueskyCommand from "@/interactions/applicationCommands/bluesky";

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
              dlsiteCommand, registerCommand, inviteCommand, blueskyCommand
            ],
          }),
        );
    }
  } catch (e) {
    console.error(e);
    return c.json(
      errorResponse(
        e instanceof Error
          ? e.message
          : "なにか問題が起こったみたいだ！[GitHub](https://github.com/yutakobayashidev/sandbox/tree/main/node/apps/kotobade-asobou-discord)で貢献しよう！"
      )
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

export default app;

import { HonoConfig } from "@/config";
import { Hono } from "hono";
import { APIInteraction } from "discord-api-types/v10";
import { verifyDiscordInteraction } from "@/middleware/verifyDiscordInteraction";

const app = new Hono<HonoConfig>();

app.get("/interaction", verifyDiscordInteraction, async (c) => {
  const body: APIInteraction = await c.req.json();

  return c.json({
    value: body,
  });
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

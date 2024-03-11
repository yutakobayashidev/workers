import { Hono } from "hono";
import { showRoutes } from "hono/dev";
import discordRoutes from "@/routes/discord";
import { HonoConfig } from "@/config";
import { vValidator } from "@hono/valibot-validator";
import { createQRCode } from "./libs/qr";
import { QRschema } from "./schema";
import { createHiroyukiVoice } from "./libs/hiroyuki";
import { object, string } from "valibot";
import { cache } from "hono/cache";

const app = new Hono<HonoConfig>();

app.use("*");

app.get("/", async (c) => {
  return c.redirect("https://yutakobayashi.dev");
});

app.route("/discord", discordRoutes);

app.get(
  "/hiroyuki",
  cache({
    cacheName: "hiroyuki",
    cacheControl: "max-age=86400",
  }),
  vValidator(
    "query",
    object({
      text: string(),
    })
  ),
  async (c) => {
    try {
      const hiroyuki = await createHiroyukiVoice(c.req.valid("query").text);
      return new Response(hiroyuki, {
        headers: {
          "Content-Type": "audio/wav",
        },
      });
    } catch (e) {
      return c.json(
        { message: (e as Error).message },
        {
          status: 500,
        }
      );
    }
  }
);

app.get("/qr", vValidator("query", QRschema), (c) => {
  const data = c.req.valid("query");

  const code = createQRCode(data);

  c.header("Content-Type", "image/svg+xml");
  c.status(201);

  return c.body(code);
});

showRoutes(app);

export default app;

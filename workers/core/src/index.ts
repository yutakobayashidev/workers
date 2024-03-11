import { Hono } from "hono";
import { showRoutes } from "hono/dev";
import discordRoutes from "@/routes/discord";
import { HonoConfig } from "@/config";
import { vValidator } from "@hono/valibot-validator";
import { createQRCode } from "./libs/qr";
import { QRschema } from "./schema";

const app = new Hono<HonoConfig>();

app.use("*");

app.get("/", async (c) => {
  c.redirect("https://yutakobayashi.dev");
});

app.route("/discord", discordRoutes);

app.get("/qr", vValidator("query", QRschema), (c) => {
  const data = c.req.valid("query");

  const code = createQRCode(data);

  c.header("Content-Type", "image/svg+xml");
  c.status(201);

  return c.body(code);
});

showRoutes(app);

export default app;

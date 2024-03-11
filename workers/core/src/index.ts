import { Hono } from "hono";
import { showRoutes } from "hono/dev";
import discordRoutes from "@/routes/discord";
import { HonoConfig } from "@/config";

const app = new Hono<HonoConfig>();

app.use("*");

app.route("/discord", discordRoutes);

showRoutes(app);

export default app;

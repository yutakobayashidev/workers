import { fetchDoodleData } from "@/services/discord/doodles";
import { HonoConfig } from "./config";

const scheduled: ExportedHandler<HonoConfig["Bindings"]>["scheduled"] = async (
  event,
  env
) => {
  switch (event.cron) {
    case "0 3 * * *":
      await fetchDoodleData(env.DEEPL_API_KEY, env.DISCORD_WEBHOOK_URL);
  }
};

export default scheduled;

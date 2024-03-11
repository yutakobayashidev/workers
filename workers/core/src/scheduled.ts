import { fetchDoodleData } from "@/services/cron/doodles";
import { changeCover } from "@/services/cron/notion-cover";
import { HonoConfig } from "./config";

const scheduled: ExportedHandler<HonoConfig["Bindings"]>["scheduled"] = async (
  event,
  env
) => {
  switch (event.cron) {
    case "0 3 * * *":
      await fetchDoodleData(env.DEEPL_API_KEY, env.DISCORD_WEBHOOK_URL);
    case "0 * * * *":
      await changeCover(env.NOTION_TOKEN, env.NOTION_DATABASE_ID);
  }
};

export default scheduled;

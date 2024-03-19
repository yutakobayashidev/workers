import { fetchDoodleData } from "@/services/cron/doodles";
import { changeCover } from "@/services/cron/notionCover";
import { HonoConfig } from "@/config";
import { todayInbox } from "@/services/cron/todayInbox";

const scheduled: ExportedHandler<HonoConfig["Bindings"]>["scheduled"] = async (
  event,
  env
) => {
  switch (event.cron) {
    case "0 * * * *":
      await fetchDoodleData(
        env.YUTA_STUDIO,
        env.DEEPL_API_KEY,
        env.DISCORD_TOKEN,
        env.DISCORD_APPLICATION_ID
      );
      await changeCover(env.NOTION_TOKEN, env.NOTION_DATABASE_ID);
      break;
    case "0 8 * * *":
      await todayInbox(
        env.DISCORD_TOKEN,
        env.DISCORD_APPLICATION_ID,
        env.CHANNEL_ID,
        env.NOTION_TOKEN,
        env.NOTION_INBOX_DATABASE_ID
      );
      break;
  }
};

export default scheduled;

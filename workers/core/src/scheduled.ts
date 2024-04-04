import { fetchDoodleData } from "@/services/cron/doodles";
import { changeCover } from "@/services/cron/notionCover";
import { HonoConfig } from "@/config";
import { todayInbox } from "@/services/cron/todayInbox";
import { sendWakaTimeStats } from "./services/cron/wakatime";
import { checkMessagesAndPostToSlack } from "./services/cron/nnn";

const scheduled: ExportedHandler<HonoConfig["Bindings"]>["scheduled"] = async (
  event,
  env,
  ctx
) => {
  switch (event.cron) {
    case "0 * * * *":
      await fetchDoodleData(
        env.YUTA_STUDIO,
        env.DEEPL_API_KEY,
        env.DISCORD_TOKEN,
        env.DISCORD_APPLICATION_ID
      );
      await changeCover(env);
      break;
    case "0 0 * * *":
      await todayInbox(env);
      break;
    case "* * * * *":
      ctx.waitUntil(
        checkMessagesAndPostToSlack(env),
      );
      break;
    case "59 14 * * 7":
      ctx.waitUntil(
        sendWakaTimeStats(env),
      );
      break;
  }
};

export default scheduled;

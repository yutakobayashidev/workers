import { fetchDoodleData } from "@/services/cron/doodles";
import { changeCover } from "@/services/cron/notionCover";
import type { HonoConfig } from "@/config";
import { todayInbox } from "@/services/cron/todayInbox";
import { sendWakaTimeStats } from "./services/cron/wakatime";
import { checkMessagesAndPostToSlack } from "./services/cron/nnn";

const scheduled: ExportedHandler<HonoConfig["Bindings"]>["scheduled"] = async (
	event,
	env,
	ctx,
) => {
	switch (event.cron) {
		case "0 * * * *":
			await fetchDoodleData(
				env.YUTA_STUDIO,
				env.DEEPL_API_KEY,
				env.DISCORD_TOKEN,
				env.DISCORD_APPLICATION_ID,
				env.DISCORD_DOODLE_CHANNEL_ID,
			);
			await changeCover(env);
			break;
		case "0 0 * * *":
			await todayInbox(env);
			break;
		case "*/5 * * * *":
			ctx.waitUntil(checkMessagesAndPostToSlack({
				YUTA_STUDIO: env.YUTA_STUDIO,
				DISCORD_TOKEN: env.DISCORD_TOKEN,
				DISCORD_APPLICATION_ID: env.DISCORD_APPLICATION_ID,
				SLACK_TOKEN: env.SLACK_TOKEN,
				DISCORD_NNN_CHANNEL_ID: env.DISCORD_NNN_CHANNEL_ID,
				SLACK_NNN_CHANNEL_ID: env.SLACK_NNN_CHANNEL_ID,
			}));
			break;
		case "59 14 * * 7":
			ctx.waitUntil(sendWakaTimeStats(env));
			break;
	}
};

export default scheduled;

import {
	type APIInteractionResponseChannelMessageWithSource,
	InteractionResponseType,
	APIEmbed,
} from "discord-api-types/v10";
import type { ApplicationCommandObj } from "@/interactions/handleApplicationCommands";
import type { InternalContext } from "@/config";
import { BLUESKY_COMMAND_NAME } from "@/constants";
import { verifyReadability } from "@/guard";

const handler = async ({
	intentObj,
	ctx,
}: {
	intentObj: ApplicationCommandObj;
	ctx: InternalContext;
}): Promise<APIInteractionResponseChannelMessageWithSource> => {
	verifyReadability(intentObj.member?.user?.id);

	const text = (intentObj.data as any).options[0].value;

	await ctx.bluesky.login();

	const res = await ctx.bluesky.post({
		body: text,
	});

	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: `https://bsky.app/profile/yutakobayashi.dev/post/${res.uri.split("/").pop()}`,
		},
	};
};

export default {
	commandName: BLUESKY_COMMAND_NAME,
	handler,
};

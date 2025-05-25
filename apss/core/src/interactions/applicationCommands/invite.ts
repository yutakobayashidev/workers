import {
	type APIInteractionResponseChannelMessageWithSource,
	InteractionResponseType,
} from "discord-api-types/v10";
import type { ApplicationCommandObj } from "@/interactions/handleApplicationCommands";
import type { InternalContext } from "@/config";
import { INVITE_COMMAND_NAME } from "@/constants";
import { verifyReadability } from "@/guard";

const handler = async ({
	intentObj,
	ctx,
}: {
	intentObj: ApplicationCommandObj;
	ctx: InternalContext;
}): Promise<APIInteractionResponseChannelMessageWithSource> => {
	verifyReadability(intentObj.member?.user?.id, ctx.env.DISCORD_DEVELOPER_USER_ID);

	if (!intentObj.channel?.id) throw new Error("チャンネルIDが見つかりません");

	const invite = await ctx.discord.createChannelInvite(intentObj.channel?.id);

	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			flags: 64,
			embeds: [
				{
					title: "招待リンク",
					description: "以下のリンクからサーバーに参加できます。",
					color: 0x5865f2,
					fields: [
						{
							name: "リンク",
							value: `https://discord.gg/${invite?.code}`,
							inline: true,
						},
						{
							name: "有効期限",
							value: invite?.expires_at
								? new Date(invite?.expires_at).toLocaleString()
								: "無期限",
							inline: true,
						},
						{
							name: "使用回数",
							value: invite?.max_uses ? invite?.max_uses.toString() : "無制限",
							inline: true,
						},
					],
					timestamp: new Date().toISOString(),
				},
			],
		},
	};
};
export default {
	commandName: INVITE_COMMAND_NAME,
	handler,
};

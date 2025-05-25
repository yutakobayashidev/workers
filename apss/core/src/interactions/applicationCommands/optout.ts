import { APIInteractionResponseChannelMessageWithSource, InteractionResponseType, APIEmbed } from 'discord-api-types/v10';
import { ApplicationCommandObj } from '@/interactions/handleApplicationCommands';
import { InternalContext } from '@/config';
import { OPTOUT_COMMAND_NAME } from '@/constants';

const handleOptOutCommand = async ({
    intentObj,
    ctx,
}: {
    intentObj: ApplicationCommandObj;
    ctx: InternalContext;
}): Promise<APIInteractionResponseChannelMessageWithSource> => {
    const userId = intentObj.member?.user?.id;
    const userKey = `optout:${userId}`;
    const userData = await ctx.kv.get(userKey);
    const isOptedOut = userData ? JSON.parse(userData).optout : false;

    const newOptOutStatus = !isOptedOut;
    await ctx.kv.put(userKey, JSON.stringify({ optout: newOptOutStatus }));

    const embed: APIEmbed = {
        title: "オプトアウト設定",
        description: newOptOutStatus ? "あなたはオプトアウトしました。N/S高等学校へのtimes送信は以降行われません。" : "オプトアウトを解除しました。",
        color: newOptOutStatus ? 0xFF0000 : 0x00FF00, // 赤色はオプトアウト、緑色はオプトアウト解除
        fields: [
            {
                name: "現在の状態",
                value: newOptOutStatus ? "オプトアウト済み" : "オプトアウト未設定",
                inline: true
            }
        ],
        footer: {
            text: "設定を更新しました"
        },
        timestamp: new Date().toISOString()
    };

    return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
            embeds: [embed]
        }
    };
};

export default {
    commandName: OPTOUT_COMMAND_NAME,
    handler: handleOptOutCommand
};

import { APIInteractionResponseChannelMessageWithSource, InteractionResponseType, APIEmbedField } from 'discord-api-types/v10';
import { ApplicationCommandObj } from '@/interactions/handleApplicationCommands';
import { InternalContext } from '@/config';
import { REGISTER_COMMAND_NAME } from '@/constants';
import commands from '@/services/discord/commands';
import { verifyReadability } from '@/guard';

const handler = async ({
    intentObj,
    ctx,
}: {
    intentObj: ApplicationCommandObj;
    ctx: InternalContext;
}): Promise<APIInteractionResponseChannelMessageWithSource> => {

    verifyReadability(intentObj.member?.user?.id);

    await ctx.discord.registerCommands({ commands });

    return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
            flags: 64,
            content: "コマンドを再登録しました",
        }
    };
};

export default {
    commandName: REGISTER_COMMAND_NAME,
    handler
};
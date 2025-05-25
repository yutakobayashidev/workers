import { APIInteractionResponseChannelMessageWithSource, InteractionResponseType, RESTPostAPIChannelInviteResult } from 'discord-api-types/v10';
import { ApplicationCommandObj } from '@/interactions/handleApplicationCommands';
import { InternalContext } from '@/config';
import { ETH_COMMAND_NAME } from '@/constants';
import { http, createPublicClient, formatEther } from 'viem'
import { mainnet } from 'viem/chains'
import { normalize } from 'viem/ens'

export const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(),
})

const handler = async ({
    intentObj,
    ctx,
}: {
    intentObj: ApplicationCommandObj;
    ctx: InternalContext;
}): Promise<APIInteractionResponseChannelMessageWithSource> => {

    let input = (intentObj.data as any).options[0].value;

    if (!intentObj.channel?.id) throw new Error("チャンネルIDが見つかりません")

    // Check if the input is an ENS name and resolve it to an address
    let address = input;
    if (input.endsWith('.eth')) {
        const ensAddress = await publicClient.getEnsAddress({
            name: normalize(input),
        });
        if (ensAddress) {
            address = ensAddress;
        } else {
            throw new Error("ENS名を解決できませんでした");
        }
    }

    const balance = await publicClient.getBalance({
        address: address,
        blockTag: 'safe'
    })

    const balanceAsEther = formatEther(balance)

    return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
            embeds: [
                {
                    title: "Ethereum Mainnet",
                    color: 0x5865F2,
                    fields: [
                        {
                            name: "Address",
                            value: address,
                            inline: true,
                        },
                        {
                            name: "Wei",
                            value: balance.toString(),
                            inline: true,
                        },
                        {
                            name: "ETH",
                            value: `${balanceAsEther} ETH`,
                            inline: true,
                        },
                        {
                            name: "EtherScan",
                            value: `[View on EtherScan](https://etherscan.io/address/${address})`,
                            inline: true,
                        },
                    ],
                    timestamp: new Date().toISOString(),
                }
            ]
        }
    };
}

export default {
    commandName: ETH_COMMAND_NAME,
    handler
};
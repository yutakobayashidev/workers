import { APIInteractionResponseChannelMessageWithSource, InteractionResponseType, APIEmbed } from 'discord-api-types/v10';
import { ApplicationCommandObj } from '@/interactions/handleApplicationCommands';
import { InternalContext } from '@/config';
import { KEYOXIDE_COMMAND_NAME } from '@/constants';
interface User {
    userData: {
        name: string;
        email: string;
    };
    claims: Claim[];
}

interface Claim {
    matches: {
        serviceprovider: {
            name: string;
        };
        profile: {
            display: string;
            uri: string;
        };
    }[];
    verification: {
        result: boolean;
    };
}


const handler = async ({
    intentObj,
}: {
    intentObj: ApplicationCommandObj;
    ctx: InternalContext;
}): Promise<APIInteractionResponseChannelMessageWithSource> => {
    const query = (intentObj.data as any).options[0].value;

    const keyoxideDomain = 'keyoxide.org';
    const url = `https://${keyoxideDomain}/api/0/profile/fetch?query=${encodeURIComponent(query)}&doVerification=true`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            return {
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    content: `Keyoxide could not fetch the profile for '${query}'. Are you sure the identifier is correct?`,
                },
            };
        }

        const res: any = await response.json();

        const embed: APIEmbed = {
            title: `Keyoxide Profile for ${query}`,
            url: `https://${keyoxideDomain}/${res.keyData.key.fetchMethod}/${query}`,
            fields: [
                {
                    name: '🔑 Fingerprint',
                    value: res.keyData.fingerprint,
                    inline: false,
                },
                ...res.keyData.users.map((user: User) => ({
                    name: `🪪 ${user.userData.name} (${user.userData.email})`,
                    value: user.claims.map(claim => {
                        const serviceName = claim.matches[0].serviceprovider.name;
                        const profileName = claim.matches[0].profile.display;
                        const profileUri = claim.matches[0].profile.uri;
                        const verified = claim.verification.result;
                        return verified ? `✅ [${profileName}](${profileUri}) (${serviceName})` : `❌ ~[${profileName}](${profileUri})~`;
                    }).join('\n'),
                    inline: false,
                })),
            ],
            color: 0x0099ff, // optional: you can customize the embed color
        };

        return {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                embeds: [embed],
            },
        };

    } catch (error: any) {
        return {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: `An error occurred while fetching the profile: ${error.message}`,
            },
        };
    }
};

export default {
    commandName: KEYOXIDE_COMMAND_NAME,
    handler,
};

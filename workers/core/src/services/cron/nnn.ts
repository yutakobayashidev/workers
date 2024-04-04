import { DiscordClient } from "@/clients/discord";


export async function checkMessagesAndPostToSlack({ YUTA_STUDIO, DISCORD_TOKEN, DISCORD_APPLICATION_ID, SLACK_TOKEN }: { YUTA_STUDIO: KVNamespace, DISCORD_TOKEN: string, DISCORD_APPLICATION_ID: string, SLACK_TOKEN: string }) {

    const lastMessageId = await YUTA_STUDIO.get("lastMessageId") as string;

    const client = new DiscordClient(DISCORD_TOKEN, DISCORD_APPLICATION_ID);

    const messages = await client.getChannelMessages("1028287639918497822", lastMessageId);

    for (const message of messages.reverse()) {
        await postToSlack(message.content, SLACK_TOKEN);
    }

    if (messages.length > 0) {
        await YUTA_STUDIO.put("lastMessageId", messages[messages.length - 1].id);
    }

}


async function postToSlack(message: string, token: string) {
    const response = await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        body: JSON.stringify({ text: message, channel: "C04H7HRV5E0" }),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to post message: ${response.status} ${response.statusText}`);
    }


}
import { DiscordClient } from "@/clients/discord";

export async function checkMessagesAndPostToSlack({
	YUTA_STUDIO,
	DISCORD_TOKEN,
	DISCORD_APPLICATION_ID,
	SLACK_TOKEN,
	DISCORD_NNN_CHANNEL_ID,
	SLACK_NNN_CHANNEL_ID,
}: {
	YUTA_STUDIO: KVNamespace;
	DISCORD_TOKEN: string;
	DISCORD_APPLICATION_ID: string;
	SLACK_TOKEN: string;
	DISCORD_NNN_CHANNEL_ID: string;
	SLACK_NNN_CHANNEL_ID: string;
}) {
	const lastMessageId = (await YUTA_STUDIO.get("lastMessageId")) as string;
	const client = new DiscordClient(DISCORD_TOKEN, DISCORD_APPLICATION_ID);
	const messages = await client.getChannelMessages(
		DISCORD_NNN_CHANNEL_ID,
		lastMessageId,
	);

	for (const message of messages.reverse()) {
		const userOptOut = await YUTA_STUDIO.get(`optout:${message.author.id}`);
		if (userOptOut && JSON.parse(userOptOut).optout) {
			continue; // オプトアウトしているユーザーのメッセージはスキップ
		}

		let formattedMessage = `*${message.author.username}:* ${message.content}`;

		// 返信の場合、元のメッセージを引用として追加
		if (message.referenced_message) {
			const originalMessage = `>${message.referenced_message.author.username}: ${message.referenced_message.content}\n`;
			formattedMessage = originalMessage + formattedMessage;
		}

		await postToSlack(formattedMessage, SLACK_TOKEN, SLACK_NNN_CHANNEL_ID, message.attachments);
	}

	if (messages.length > 0) {
		await YUTA_STUDIO.put("lastMessageId", messages[messages.length - 1].id);
	}
}

async function postToSlack(
	message: string,
	token: string,
	channelId: string,
	attachments: any[] = [],
) {
	const blocks: {
		type: string;
		text?: { type: string; text: string };
		image_url?: string;
		alt_text?: string;
	}[] = [
			{
				type: "section",
				text: { type: "mrkdwn", text: message },
			},
		];

	for (const attachment of attachments) {
		blocks.push({
			type: "image",
			image_url: attachment.url,
			alt_text: "Discord Image",
		});
	}

	const response = await fetch("https://slack.com/api/chat.postMessage", {
		method: "POST",
		body: JSON.stringify({ channel: channelId, blocks }),
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		throw new Error(
			`Failed to post message: ${response.status} ${response.statusText}`,
		);
	}
}

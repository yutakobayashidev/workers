import { DiscordClient } from "@/clients/discord";

interface DiscordMessage {
	id: string;
	author: {
		id: string;
		username: string;
		avatar: string | null;
		discriminator: string;
	};
	content: string;
	timestamp: string;
	referenced_message?: DiscordMessage;
	attachments: Array<{
		url: string;
		filename: string;
	}>;
	guild_id?: string;
}

export async function checkMessagesAndPostToSlack({
	YUTA_STUDIO,
	DISCORD_TOKEN,
	DISCORD_APPLICATION_ID,
	SLACK_TOKEN,
	DISCORD_NNN_CHANNEL_ID,
	SLACK_NNN_CHANNEL_ID,
	DISCORD_GUILD_ID,
}: {
	YUTA_STUDIO: KVNamespace;
	DISCORD_TOKEN: string;
	DISCORD_APPLICATION_ID: string;
	SLACK_TOKEN: string;
	DISCORD_NNN_CHANNEL_ID: string;
	SLACK_NNN_CHANNEL_ID: string;
	DISCORD_GUILD_ID: string;
}) {
	const lastMessageId = (await YUTA_STUDIO.get("lastMessageId")) as string;
	const client = new DiscordClient(DISCORD_TOKEN, DISCORD_APPLICATION_ID);
	const messages = await client.getChannelMessages(
		DISCORD_NNN_CHANNEL_ID,
		lastMessageId,
	);

	// Get guild information for server name
	const guildInfo = await client.getGuild(DISCORD_GUILD_ID);

	for (const message of messages.reverse()) {
		const userOptOut = await YUTA_STUDIO.get(`optout:${message.author.id}`);
		if (userOptOut && JSON.parse(userOptOut).optout) {
			continue; // オプトアウトしているユーザーのメッセージはスキップ
		}

		// Create embedded card format instead of basic text
		await postToSlackCard({
			message,
			token: SLACK_TOKEN,
			channelId: SLACK_NNN_CHANNEL_ID,
			guildName: guildInfo?.name || 'Discord Server'
		});
	}

	if (messages.length > 0) {
		await YUTA_STUDIO.put("lastMessageId", messages[messages.length - 1].id);
	}
}

function getDiscordAvatarUrl(userId: string, avatar: string | null): string {
	if (!avatar) {
		// Default Discord avatar based on user discriminator
		return `https://cdn.discordapp.com/embed/avatars/${parseInt(userId) % 5}.png`;
	}
	return `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png?size=64`;
}

function formatTimestamp(timestamp: string): string {
	const date = new Date(timestamp);
	return `<!date^${Math.floor(date.getTime() / 1000)}^{date_short} at {time}|${date.toLocaleString()}>`;
}

async function postToSlackCard({
	message,
	token,
	channelId,
	guildName
}: {
	message: DiscordMessage;
	token: string;
	channelId: string;
	guildName: string;
}) {
	const avatarUrl = getDiscordAvatarUrl(message.author.id, message.author.avatar);
	const timestamp = formatTimestamp(message.timestamp);
	
	const blocks: any[] = [];
	
	// Reply context if this is a reply
	if (message.referenced_message) {
		blocks.push({
			type: "context",
			elements: [
				{
					type: "mrkdwn",
					text: `↩️ Replying to *${message.referenced_message.author.username}*: ${message.referenced_message.content.length > 100 ? message.referenced_message.content.substring(0, 100) + '...' : message.referenced_message.content}`
				}
			]
		});
	}
	
	// Main message content with author info
	blocks.push({
		type: "section",
		text: {
			type: "mrkdwn",
			text: message.content || "_No text content_"
		},
		accessory: {
			type: "image",
			image_url: avatarUrl,
			alt_text: `${message.author.username}'s avatar`
		}
	});
	
	// Footer with server info and timestamp
	blocks.push({
		type: "context",
		elements: [
			{
				type: "mrkdwn",
				text: `*${message.author.username}* • ${guildName} • ${timestamp}`
			}
		]
	});
	
	// Add image attachments
	for (const attachment of message.attachments) {
		if (attachment.url && (attachment.filename.match(/\.(jpeg|jpg|gif|png|webp)$/i))) {
			blocks.push({
				type: "image",
				image_url: attachment.url,
				alt_text: attachment.filename
			});
		}
	}
	
	const response = await fetch("https://slack.com/api/chat.postMessage", {
		method: "POST",
		body: JSON.stringify({ 
			channel: channelId, 
			blocks,
			unfurl_links: false,
			unfurl_media: false
		}),
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(
			`Failed to post message: ${response.status} ${response.statusText} - ${errorText}`,
		);
	}
}

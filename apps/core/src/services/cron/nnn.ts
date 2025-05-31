import { DiscordClient } from "@/clients/discord";

export async function checkMessagesAndPostToSlack({
	YUTA_STUDIO,
	DISCORD_TOKEN,
	DISCORD_APPLICATION_ID,
	DISCORD_GUILD_ID,
	SLACK_TOKEN,
	DISCORD_NNN_CHANNEL_ID,
	SLACK_NNN_CHANNEL_ID,
}: {
	YUTA_STUDIO: KVNamespace;
	DISCORD_TOKEN: string;
	DISCORD_APPLICATION_ID: string;
	DISCORD_GUILD_ID: string;
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

	// Get guild information for server context
	const guild = await client.getGuild(DISCORD_GUILD_ID);

	for (const message of messages.reverse()) {
		const userOptOut = await YUTA_STUDIO.get(`optout:${message.author.id}`);
		if (userOptOut && JSON.parse(userOptOut).optout) {
			continue; // オプトアウトしているユーザーのメッセージはスキップ
		}

		await postToSlack(message, guild, SLACK_TOKEN, SLACK_NNN_CHANNEL_ID);
	}

	if (messages.length > 0) {
		await YUTA_STUDIO.put("lastMessageId", messages[messages.length - 1].id);
	}
}

async function postToSlack(
	message: any,
	guild: any,
	token: string,
	channelId: string,
) {
	// Get Discord user avatar URL
	const avatarUrl = message.author.avatar 
		? `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png?size=64`
		: `https://cdn.discordapp.com/embed/avatars/${Number(message.author.discriminator) % 5}.png`;

	// Create rich message blocks with embedded card layout
	const blocks: any[] = [];

	// Header section with user info and avatar
	blocks.push({
		type: "section",
		text: {
			type: "mrkdwn",
			text: `*${message.author.username}*${message.author.discriminator !== "0" ? `#${message.author.discriminator}` : ""}`
		},
		accessory: {
			type: "image",
			image_url: avatarUrl,
			alt_text: `${message.author.username} avatar`
		}
	});

	// Reply context if this is a reply
	if (message.referenced_message) {
		blocks.push({
			type: "context",
			elements: [
				{
					type: "mrkdwn",
					text: `↪️ Replying to *${message.referenced_message.author.username}*: ${message.referenced_message.content.length > 100 ? message.referenced_message.content.substring(0, 100) + "..." : message.referenced_message.content}`
				}
			]
		});
	}

	// Main message content
	if (message.content) {
		blocks.push({
			type: "section",
			text: {
				type: "mrkdwn",
				text: message.content
			}
		});
	}

	// Handle image attachments
	for (const attachment of message.attachments || []) {
		if (attachment.content_type?.startsWith("image/")) {
			blocks.push({
				type: "image",
				image_url: attachment.url,
				alt_text: attachment.filename || "Discord Image",
				title: {
					type: "plain_text",
					text: attachment.filename || "Image"
				}
			});
		}
	}

	// Footer with server context and timestamp
	blocks.push({
		type: "context",
		elements: [
			{
				type: "mrkdwn",
				text: `📡 ${guild.name} • <!date^${Math.floor(new Date(message.timestamp).getTime() / 1000)}^{date_pretty} at {time}|${message.timestamp}>`
			}
		]
	});

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
		throw new Error(
			`Failed to post message: ${response.status} ${response.statusText}`,
		);
	}
}

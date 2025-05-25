import type {
	RESTPostAPIChannelMessageJSONBody,
	RESTGetAPIChannelMessagesResult,
	RESTPostAPIApplicationCommandsJSONBody,
	RESTPostAPIChannelInviteResult,
} from "discord-api-types/v10";
import FormData from "form-data";

export class DiscordClient {
	private BASE_URL = "https://discord.com/api/v10/";
	private config: { headers: Record<string, string> };
	private applicationId: string;

	constructor(botToken: string, applicationId: string) {
		this.config = {
			headers: {
				Authorization: `Bot ${botToken}`,
				"Content-Type": "application/json",
			},
		};

		this.applicationId = applicationId;
	}

	async createChannelInvite(channelId: string) {
		try {
			const response = await fetch(
				`${this.BASE_URL}/channels/${channelId}/invites`,
				{
					method: "POST",
					headers: this.config.headers,
					body: JSON.stringify({
						max_age: 86400,
						max_uses: 0,
						temporary: false,
						unique: true,
					}),
				},
			);

			if (!response.ok) {
				throw new Error(`Error: ${response.status}`);
			}

			const invite = (await response.json()) as RESTPostAPIChannelInviteResult;
			console.log("Invite created:", invite);
			return invite;
		} catch (error) {
			console.error("Failed to create invite:", error);
		}
	}

	async sendMessage({
		channelId,
		body,
	}: { channelId: string; body: RESTPostAPIChannelMessageJSONBody }) {
		const res = await fetch(`${this.BASE_URL}/channels/${channelId}/messages`, {
			method: "POST",
			body: JSON.stringify(body),
			headers: this.config.headers,
		});
		if (!res.ok) {
			console.log(await res.text());
			throw new Error(
				`Failed to send message: ${res.status} ${res.statusText}`,
			);
		}
	}

	async sendTextFile({
		channelId,
		file,
	}: {
		channelId: string;
		file: {
			content: string;
			name: string;
		};
	}) {
		const form = new FormData();
		form.append(
			"file",
			new Blob([file.content], { type: "text/plain" }),
			file.name,
		);

		const res = await fetch(`${this.BASE_URL}/channels/${channelId}/messages`, {
			method: "POST",
			body: form as unknown as BodyInit,
			headers: {
				Authorization: this.config.headers.Authorization,
			},
		});

		if (!res.ok) {
			throw new Error(
				`Failed to send message: ${res.status} ${res.statusText}`,
			);
		}
	}

	async registerCommands({
		commands,
	}: {
		commands: RESTPostAPIApplicationCommandsJSONBody[];
	}) {
		const res = await fetch(
			`${this.BASE_URL}/applications/${this.applicationId}/commands`,
			{
				method: "PUT",
				body: JSON.stringify(commands),
				headers: this.config.headers,
			},
		);
		if (!res.ok) {
			throw new Error(
				`Failed to register commands: ${res.status} ${res.statusText}`,
			);
		}
	}

	async getChannelMessages(channelId: string, after?: string) {
		const url = new URL(`${this.BASE_URL}/channels/${channelId}/messages`);
		if (after) {
			url.searchParams.append("after", after);
		}

		const res = await fetch(url.toString(), {
			headers: this.config.headers,
		});

		if (!res.ok) {
			throw new Error(
				`Failed to get messages: ${res.status} ${res.statusText}`,
			);
		}

		return (await res.json()) as RESTGetAPIChannelMessagesResult;
	}
}

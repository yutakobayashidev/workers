import type { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";

export const INVITE_COMMAND: RESTPostAPIApplicationCommandsJSONBody = {
	name: "invite",
	description: "サーバーへの招待リンクを生成します",
};

export const NOTION_COMMAND: RESTPostAPIApplicationCommandsJSONBody = {
	name: "notion",
	description: "Notion全体を検索します",
	options: [
		{
			name: "keyword",
			required: true,
			type: 3,
			description: "検索キーワード",
		},
	],
};

export const REGISTER_COMMAND: RESTPostAPIApplicationCommandsJSONBody = {
	name: "register",
	description: "Discordボットのコマンドを再登録します",
};

export const DLSITE_COMMAND: RESTPostAPIApplicationCommandsJSONBody = {
	name: "dlsite",
	description: "DLsiteの作品をRJコードから検索します",
	options: [
		{
			name: "コード",
			required: true,
			type: 3,
			description: "RJコード",
		},
	],
};

export const BLUESKY_COMMAND: RESTPostAPIApplicationCommandsJSONBody = {
	name: "bluesky",
	description: "Blueskyに投稿します",
	options: [
		{
			name: "text",
			required: true,
			type: 3,
			description: "テキスト",
		},
	],
};

export const ETH_COMMAND: RESTPostAPIApplicationCommandsJSONBody = {
	name: "eth",
	description: "Ethereum Mainnetの残高を確認します",
	options: [
		{
			name: "address",
			required: true,
			type: 3,
			description: "アドレス",
		},
	],
};

export const KEYOXIDE_COMMAND: RESTPostAPIApplicationCommandsJSONBody = {
	name: "keyoxide",
	description: "Keyoxideのプロフィールを検索します",
	options: [
		{
			name: "query",
			required: true,
			type: 3,
			description: "email,fingerprint",
		},
	],
};

export const OPTOUT_COMMAND: RESTPostAPIApplicationCommandsJSONBody = {
	name: "optout",
	description:
		"N/S高等学校への#times_yuta-studioへのメッセージ配信をオプトアウトします",
};

const commands: RESTPostAPIApplicationCommandsJSONBody[] = [
	INVITE_COMMAND,
	NOTION_COMMAND,
	REGISTER_COMMAND,
	DLSITE_COMMAND,
	BLUESKY_COMMAND,
	ETH_COMMAND,
	OPTOUT_COMMAND,
	KEYOXIDE_COMMAND,
];

export default commands;

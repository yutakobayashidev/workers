import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";

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

export const EMAIL_COMMAND: RESTPostAPIApplicationCommandsJSONBody = {
  name: "email",
  description: "特定のメールアドレスにメールを送信します",
};

export const REGISTER_COMMAND: RESTPostAPIApplicationCommandsJSONBody = {
  name: "register",
  description: "Discordボットのコマンドを再登録します",
};

const commands: RESTPostAPIApplicationCommandsJSONBody[] = [
  INVITE_COMMAND,
  NOTION_COMMAND,
  REGISTER_COMMAND,
];

export default commands;

import { DiscordClient } from "@/clients/discord";
import { Client } from "@notionhq/client";
import { APIEmbedField } from "discord-api-types/v10";

export const todayInbox = async (
    DISCORD_TOKEN: string,
    DISCORD_APPLICATION_ID: string,
    CHANNEL_ID: string,
    NOTION_TOKEN: string,
    NOTION_INBOX_DATABASE_ID: string
) => {
    const notion = new Client({
        auth: NOTION_TOKEN,
    });

    const client = new DiscordClient(DISCORD_TOKEN, DISCORD_APPLICATION_ID);

    const today = new Date().toISOString().substring(0, 10);

    const response = await notion.databases.query({
        database_id: NOTION_INBOX_DATABASE_ID,
        filter: {
            and: [
                {
                    property: "Status",
                    status: {
                        does_not_equal: "Done",
                    },
                },
                {
                    property: "Status",
                    status: {
                        does_not_equal: "Pending",
                    },
                },
                {
                    property: "Date",
                    date: {
                        equals: today,
                    },
                },
            ],
        },
    });


    const fields: APIEmbedField[] = [];
    response.results.map((result) => {
        // @ts-ignore
        const title = result.properties["Name"].title[0].text.content;
        // @ts-ignore
        const Status = result.properties["Status"].status?.name;
        const pageId = result.id;
        const field = {
            name: `:white_check_mark: ${title}`,
            value: `ページID: ${pageId}\nステータス: ${Status}`,
        };
        fields.push(field);
    });

    await client.sendMessage({
        channelId: CHANNEL_ID,
        body: {
            embeds: [
                {
                    title: ":inbox_tray:  今日のタスク",
                    description: `${Object.keys(response["results"]).length
                        }件の未完了タスクが見つかりました。`,
                    fields,
                    color: 4303284,
                    timestamp: new Date().toISOString(),
                },
            ],
        }
    });

};

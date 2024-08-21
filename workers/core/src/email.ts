import { HonoConfig } from "./config";
import PostalMime, { type Email } from 'postal-mime';
import { DiscordClient } from "./clients/discord";

const email: ExportedHandler<HonoConfig["Bindings"]>["email"] = async (
    message, env, ctx,
) => {

    ctx.waitUntil(notifyMessage(message, env));

};


const buildNotifyMessage = async (message: ForwardableEmailMessage, parsedEmail: Email) => {


    return {
        embeds: [
            {
                title: message.headers.get('subject') || "",
                description: parsedEmail.text,
                fields: [
                    {
                        name: "From",
                        value: message.from,
                    },
                    {
                        name: "To",
                        value: message.to,
                    },
                    {
                        name: "Message ID",
                        value: message.headers.get('message-id') || "",
                    },
                    {
                        name: "Received",
                        value: message.headers.get('received') || "",
                    },
                    {
                        name: "Date",
                        value: message.headers.get('date') || "",
                    },
                ]
            }
        ]

    };
};

const streamToArrayBuffer = async (stream: ReadableStream, streamSize: number) => {
    let result = new Uint8Array(streamSize);
    let bytesRead = 0;
    const reader = stream.getReader();
    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        result.set(value, bytesRead);
        bytesRead += value.length;
    }
    return result;
};

const notifyMessage = async function (message: ForwardableEmailMessage, env: HonoConfig["Bindings"]) {
    try {

        const rawEmail = await streamToArrayBuffer(message.raw, message.rawSize);

        const parser = new PostalMime();

        const parsedEmail = await parser.parse(rawEmail);

        const notifyMessage = await buildNotifyMessage(message, parsedEmail);

        await message.forward(env.FORWARD_EMAIL);

        const client = new DiscordClient(env.DISCORD_TOKEN, env.DISCORD_APPLICATION_ID);

        await client.sendMessage({
            channelId: env.CHANNEL_ID,
            body: notifyMessage
        });


    } catch (e) {
        console.error(e);
    }
};


export default email;

import { HonoConfig } from "./config";
import PostalMime, { type Email } from 'postal-mime';
import { loadSummarizationChain } from "langchain/chains";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { DiscordClient } from "./clients/discord";

const email: ExportedHandler<HonoConfig["Bindings"]>["email"] = async (
    message, env, ctx,
) => {

    ctx.waitUntil(notifyMessage(message, env));

};


const buildNotifyMessage = async (message: ForwardableEmailMessage, parsedEmail: Email, env: HonoConfig["Bindings"]) => {

    const count = await env.YUTA_STUDIO.get(message.from) || "0";

    await env.YUTA_STUDIO.put(message.from, (parseInt(count) + 1).toString(), { expirationTtl: 3600 });

    const summary = parseInt(count) >= 5 ? "レート制限のため、要約をスキップしました" : await summarizeEmail(parsedEmail.text, env);

    return {
        embeds: [
            {
                title: message.headers.get('subject') || "",
                description: summary,
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

async function summarizeEmail(text: string | undefined, env: HonoConfig["Bindings"]) {
    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
    const docs = await textSplitter.createDocuments([text ?? ""]);

    const prompt = new PromptTemplate({
        inputVariables: ['text'],
        template: `
    Briefly summarize the contents of the following e-mail in Japanese::

    "{text}"

    CONCISE SUMMARY:
    `
    });

    const summarizationChain = loadSummarizationChain(new OpenAI({ openAIApiKey: env.OPENAI_API_KEY, temperature: 0, modelName: "gpt-3.5-turbo" }), {
        type: "map_reduce",
        returnIntermediateSteps: true,
        combineMapPrompt: prompt,
        combinePrompt: prompt,
    });

    const summary = await summarizationChain.call({
        input_documents: docs,
    });

    return summary.text;
}

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

        const notifyMessage = await buildNotifyMessage(message, parsedEmail, env);

        await message.forward(env.FORWARD_EMAIL);

        const client = new DiscordClient(env.DISCORD_TOKEN, env.DISCORD_APPLICATION_ID);

        await client.sendMessage({
            channelId: "1028287639918497822",
            body: notifyMessage
        });


    } catch (e) {
        console.error(e);
    }
};


export default email;

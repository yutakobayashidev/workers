import { fromHtml } from "hast-util-from-html";
import { toMdast } from "hast-util-to-mdast";
import { toMarkdown } from "mdast-util-to-markdown";
import { select } from "hast-util-select";
import { translate } from "@/libs/translate"
import { DiscordClient } from "@/clients/discord";

const LANGUAGE = "ja";

const getColor = (index: number) => {
  const colors = [4359668, 14369847, 16036864, 1023320];
  return colors[index % colors.length];
};

async function getDoodleDescription(authKey: string, url: string) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const hast = fromHtml(html, { fragment: true });
    const firstParagraph = select(".doodle-module.text-block._module-wrapper .glue-page .text.add_link_class p", hast);
    const metaDescription = select('meta[name="description"]', hast);

    if (firstParagraph) {
      return translate(authKey, toMarkdown(toMdast({ type: "root", children: [firstParagraph] })), "JA");
    } else if (metaDescription) {
      return translate(authKey, metaDescription.properties.content as string, "JA");
    }
  } catch (error) {
    console.error("Error fetching Doodle description:", error);
  }
  return undefined;
}

async function fetchDoodleData(
  YUTA_STUDIO: KVNamespace,
  authKey: string,
  DISCORD_TOKEN: string,
  DISCORD_APPLICATION_ID: string
) {


  const current = new Date();
  const year = current.getFullYear();
  const month = current.getMonth() + 1;

  try {
    const response = await fetch(`https://www.google.com/doodles/json/${year}/${month}?hl=${LANGUAGE}`);
    const doodles: any = await response.json();

    for (const doodle of doodles) {
      await postDoodleToDiscord({ authKey, doodle, DISCORD_TOKEN, DISCORD_APPLICATION_ID, YUTA_STUDIO });
    }
  } catch (error) {
    console.error("Error fetching Google Doodle:", error);
  }
}

async function postDoodleToDiscord({ authKey, doodle, DISCORD_TOKEN, DISCORD_APPLICATION_ID, YUTA_STUDIO }: {
  authKey: string,
  doodle: any,
  DISCORD_TOKEN: string,
  DISCORD_APPLICATION_ID: string
  YUTA_STUDIO: KVNamespace
}) {

  const doodlePostedKey = `doodle:${doodle.name}`;

  const doodlePosted = await YUTA_STUDIO.get(doodlePostedKey);

  if (doodlePosted) {
    console.log(`Doodle ${doodle.name} already posted.`);
    return;
  }

  const description = await getDoodleDescription(authKey, `https://doodles.google/doodle/${doodle.name}`);

  const client = new DiscordClient(DISCORD_TOKEN, DISCORD_APPLICATION_ID);

  const colorIndex = await YUTA_STUDIO.get("google_color");
  const color = getColor(parseInt(colorIndex ?? "0"));
  await YUTA_STUDIO.put(
    "google_color",
    String((parseInt(colorIndex ?? "0") + 1) % 4)
  );

  await client.sendMessage({
    channelId: "1043762190303363112",
    body: {
      embeds: [
        {
          title: doodle.ja?.query ?? doodle.query,
          description,
          url: `https://doodles.google/doodle/${doodle.name}`,
          color,
          fields: [
            {
              name: "📅 公開日",
              value: `${doodle.run_date_array[0]}年${doodle.run_date_array[1]}月${doodle.run_date_array[2]}日`,
              inline: true,
            },
            {
              name: "🔍 Google検索",
              value: `[${doodle.query}](https://www.google.com/search?q=${encodeURIComponent(doodle.query)})`,
              inline: true,
            },
            {
              name: "📱 ツイート",
              value: `[#GoogleDoodle](https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://www.google.com/doodles/${doodle.name}`)}&text=${encodeURIComponent(doodle.share_text)}&via=GoogleDoodles&lang=ja)`,
            },
          ],
          footer: {
            text: "© Google LLC",
          },
          image: {
            url: `https:${doodle.url}`,
          },
        },
      ],
    }
  });

  await YUTA_STUDIO.put(doodlePostedKey, "true");

}

export { fetchDoodleData, getDoodleDescription };

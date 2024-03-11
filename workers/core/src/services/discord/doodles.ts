import { format } from "date-fns";
import { fromHtml } from "hast-util-from-html";
import { toMdast } from "hast-util-to-mdast";
import { toMarkdown } from "mdast-util-to-markdown";
import { select } from "hast-util-select";
import { translate } from "@/libs/translate";
import { createHiroyukiVoice } from "@/libs/hiroyuki";

const formatDate = (dateArray: string[]) =>
  `${dateArray[0]}-${dateArray[1]}-${dateArray[2]}`;

const getRandomColor = () => {
  const colors = [4359668, 14369847, 16036864, 1023320];
  return colors[Math.floor(Math.random() * colors.length)];
};

async function getDoodleDescription(url: string) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const hast = fromHtml(html, { fragment: true });
    const firstParagraph = select(
      ".doodle-module.text-block._module-wrapper .glue-page .text.add_link_class p",
      hast
    );
    const metaDescription = select('meta[name="description"]', hast);

    if (firstParagraph) {
      return translate(
        toMarkdown(toMdast({ type: "root", children: [firstParagraph] })),
        "JA"
      );
    } else if (metaDescription) {
      return translate(metaDescription.properties.content as string, "JA");
    }
  } catch (error) {
    console.error("Error fetching Doodle description:", error);
  }
  return null;
}

async function fetchDoodleData(discordWebHookURL: string) {
  const today = format(new Date(), "yyyy-MM-dd");
  const language = "ja";
  const ENDPOINT = `https://www.google.com/doodles/json/${today.substring(
    0,
    4
  )}/${today.substring(5, 7)}?hl=${language}`;

  try {
    const response = await fetch(ENDPOINT);
    const doodles: any = await response.json();

    for (const doodle of doodles) {
      const doodleDate = formatDate(doodle.run_date_array);
      if (today === doodleDate) {
        await postDoodleToDiscord(doodle, discordWebHookURL);
        break;
      }
    }
  } catch (error) {
    console.error("Error fetching Google Doodle:", error);
  }
}

async function postDoodleToDiscord(doodle: any, discordWebHookURL: string) {
  const color = getRandomColor();
  const description = await getDoodleDescription(doodle.url);
  const wavBlob = await createHiroyukiVoice(description);

  const message = {
    username: "Today's Doodle",
    avatar_url:
      "https://pbs.twimg.com/profile_images/1440775265928417284/ywTBFW6L_400x400.png",
    embeds: [
      {
        title: doodle.title,
        description,
        url: doodle.url,
        color,
        fields: [
          {
            name: "📅 公開日",
            value: `${doodle.run_date_array[0]}年${doodle.run_date_array[1]}月${doodle.run_date_array[2]}日`,
            inline: true,
          },
          {
            name: "🔍 Google検索",
            value: `[${
              doodle.query
            }](https://www.google.com/search?q=${encodeURIComponent(
              doodle.query
            )})`,
            inline: true,
          },
          {
            name: "📱 ツイート",
            value: `[#GoogleDoodle](https://twitter.com/intent/tweet?url=${encodeURIComponent(
              `https://www.google.com/doodles/${doodle.name}`
            )}&text=${encodeURIComponent(
              doodle.share_text
            )}&via=GoogleDoodles&lang=ja)`,
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
  };

  try {
    const formData = new FormData();
    formData.append("payload_json", JSON.stringify(message));
    formData.append("file", wavBlob, `${doodle.name}.wav`);
    await fetch(discordWebHookURL, { method: "POST", body: formData });
  } catch (error) {
    console.error("Error posting to Discord:", error);
  }
}

export { fetchDoodleData, getDoodleDescription };

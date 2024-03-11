import { Client } from "@notionhq/client";

export const changeCover = async (
  NOTION_TOKEN: string,
  NOTION_DATABASE_ID: string
) => {
  const notion = new Client({
    auth: NOTION_TOKEN,
  });

  const res = await notion.databases.query({
    database_id: NOTION_DATABASE_ID,
  });

  const index = Math.floor(Math.random() * res.results.length);
  const randomPage = res.results[index];

  console.log("Selected page:", randomPage);

  // @ts-ignore
  const coverUrl = randomPage.cover?.external?.url;
  if (coverUrl) {
    await notion.databases.update({
      database_id: NOTION_DATABASE_ID,
      cover: {
        type: "external",
        external: {
          url: coverUrl,
        },
      },
    });
  } else {
    console.error("No cover found for the selected page");
  }
};

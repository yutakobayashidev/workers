import { APIInteractionResponseChannelMessageWithSource, InteractionResponseType, APIEmbed } from 'discord-api-types/v10';
import { ApplicationCommandObj } from '@/interactions/handleApplicationCommands';
import { InternalContext } from '@/config';
import { DLSITE_COMMAND_NAME } from '@/constants';
import { Work } from '@/types';

const handler = async ({
  intentObj,
  ctx,
}: {
  intentObj: ApplicationCommandObj;
  ctx: InternalContext;
}): Promise<APIInteractionResponseChannelMessageWithSource> => {
  const code = (intentObj.data as any).options[0].value;

  try {
    const details = await fetch(`https://www.dlsite.com/maniax/api/=/product.json?workno=${code}`).then(res => res.json()) as Work[];

    if (details.length > 0) {
      const genreLinks: string[] = [];
      const genres = details[0].genres || [];

      for (const genre of genres) {
        const link = `[${genre.name}](https://www.dlsite.com/${details[0].site_id}/works/genre/=/genre/${genre.search_val}/from/work.genre)`;
        genreLinks.push(link);
      }

      const ganres = genreLinks.join(' ');

      const embed: APIEmbed = {
        title: details[0].work_name,
        description: details[0].intro_s,
        url: `https://www.dlsite.com/${details[0].site_id}/work/=/product_id/${details[0].workno}.html`,
        color: 0x052a83,
        author: {
          name: details[0].maker_name,
          url: `https://www.dlsite.com/${details[0].site_id}/circle/profile/=/maker_id/${details[0].maker_id}.html`
        },
        fields: [
          { name: '販売日', value: new Date(details[0].regist_date).toLocaleDateString() },
          { name: '価格', value: `${details[0].price.toLocaleString()}円 / ${details[0].point}pt` },
          { name: '年齢指定', value: details[0].age_category_string },
          { name: '作品形式', value: details[0].work_type_string },
          { name: 'ファイル形式', value: details[0].file_type }
        ],
        thumbnail: {
          url: `https://img.dlsite.jp/${details[0].image_main.relative_url}`
        }
      };

      if (genres.length > 0) {
        embed.fields?.push({ name: 'ジャンル', value: ganres });
      }

      if (details[0].pages) {
        embed.fields?.push({ name: 'ページ数', value: details[0].pages });
      }

      embed.fields = embed.fields || [];
      embed.fields.push({ name: 'ファイル容量', value: `総計 ${details[0].contents[0].file_size_unit}` });
      embed.fields.push({ name: 'コード', value: details[0].workno });

      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          embeds: [embed]
        }
      };
    } else {
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: '作品が見つかりませんでした。',
          flags: 64
        }
      };
    }
  } catch (error) {
    throw new Error('作品の情報を取得できませんでした。');
  }
};

export default {
  commandName: DLSITE_COMMAND_NAME,
  handler
};
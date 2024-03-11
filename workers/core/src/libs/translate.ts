import deepl, { DeeplLanguages } from "deepl";

export const translate = async (
  authKey: string,
  text: string,
  target: DeeplLanguages
) => {
  const res = await deepl({
    text,
    target_lang: target,
    auth_key: authKey,
    free_api: true,
  })
    .then((result) => result.data.translations[0].text)
    .catch((error) => {
      console.error(error);
      return error;
    });

  return res;
};

export async function translate(
	authKey: string,
	text: string,
	targetLanguage: string,
): Promise<string> {
	const apiUrl = `https://api-free.deepl.com/v2/translate?auth_key=${authKey}&text=${encodeURIComponent(text)}&target_lang=${targetLanguage}`;

	const response = await fetch(apiUrl, {
		method: "POST",
	});

	const data: any = await response.json();
	return data.translations[0].text;
}

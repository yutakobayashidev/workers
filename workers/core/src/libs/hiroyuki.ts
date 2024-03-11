export async function createHiroyukiVoice(text: string) {
  const res = await fetch(
    "https://plbwpbyme3.execute-api.ap-northeast-1.amazonaws.com/production/coefonts/19d55439-312d-4a1d-a27b-28f0f31bedc5/try",
    {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        text: text,
      }),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to create Hiroyuki voice");
  }

  const json: any = await res.json();

  return await fetch(json.location).then((res) => res.blob());
}

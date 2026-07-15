export default async function handler(req, res) {
  // CORS 허용 (Swift 앱에서 호출할 수 있도록)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST 요청만 허용됩니다." });
  }

  try {
    const { image, prompt } = req.body;

    if (!image || !prompt) {
      return res.status(400).json({ error: "image와 prompt가 필요합니다." });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: "image/jpeg", data: image }
              },
              { type: "text", text: prompt }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API 오류:", errorText);
      return res.status(response.status).json({ error: "AI 분석 요청 실패" });
    }

    const data = await response.json();
    const rawText = data.content[0].text;
    const cleanText = rawText.replace(/```json|```/g, "").trim();

    const parsed = JSON.parse(cleanText);
    return res.status(200).json(parsed);

  } catch (error) {
    console.error("프록시 오류:", error);
    return res.status(500).json({ error: "서버 내부 오류가 발생했습니다." });
  }
}

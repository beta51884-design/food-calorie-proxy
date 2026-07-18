module.exports = async (req, res) => {
  // CORS 허용 (Swift 앱에서 호출할 수 있도록)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "POST 요청만 허용됩니다." });
    return;
  }

  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({ error: "GEMINI_API_KEY 환경 변수가 설정되지 않았습니다." });
    return;
  }

  try {
    const { image, prompt } = req.body || {};

    if (!image || !prompt) {
      res.status(400).json({ error: "image와 prompt가 필요합니다." });
      return;
    }

    // 모델 이름을 환경 변수로 빼둠 — 나중에 Google이 모델을 또 종료시켜도
    // 코드 수정/재배포 없이 Vercel의 Environment Variables에서 값만 바꾸면 됨.
    // 환경 변수가 없으면 현재 기본값(gemini-3.1-flash-lite)을 사용.
    const modelName = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
    const geminiUrl =
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=` +
      process.env.GEMINI_API_KEY;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { inline_data: { mime_type: "image/jpeg", data: image } },
              { text: prompt }
            ]
          }
        ]
      })
    });

    const rawBody = await geminiResponse.text();

    if (!geminiResponse.ok) {
      console.error("Gemini API 오류:", modelName, geminiResponse.status, rawBody);
      res.status(502).json({
        error: "Gemini API 호출 실패",
        model: modelName,
        status: geminiResponse.status,
        detail: rawBody
      });
      return;
    }

    let data;
    try {
      data = JSON.parse(rawBody);
    } catch (e) {
      console.error("Gemini 응답 파싱 실패:", rawBody);
      res.status(502).json({ error: "Gemini 응답을 해석할 수 없습니다.", detail: rawBody });
      return;
    }

    const candidate = data?.candidates?.[0];
    const rawText = candidate?.content?.parts?.[0]?.text;

    if (!rawText) {
      console.error("Gemini 응답에 텍스트가 없음:", JSON.stringify(data));
      res.status(502).json({ error: "Gemini 응답에 결과가 없습니다.", detail: data });
      return;
    }

    const cleanText = rawText.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanText);
    } catch (e) {
      console.error("음식 분석 JSON 파싱 실패:", cleanText);
      res.status(502).json({ error: "분석 결과 형식이 올바르지 않습니다.", detail: cleanText });
      return;
    }

    res.status(200).json(parsed);
  } catch (error) {
    console.error("프록시 오류:", error);
    res.status(500).json({ error: "서버 내부 오류가 발생했습니다.", detail: String(error) });
  }
};

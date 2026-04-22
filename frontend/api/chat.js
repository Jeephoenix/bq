export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const body     = req.body || {};
    const messages = body.messages || [];
    const system   = body.system   || "";

    const filtered = messages.filter(m => m.role === "user" || m.role === "assistant");
    while (filtered.length > 0 && filtered[0].role === "assistant") {
      filtered.shift();
    }

    if (filtered.length === 0) {
      return res.status(200).json({ text: "Please ask me a question about BaseQuest!" });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model:       "llama-3.1-8b-instant",
        max_tokens:  1000,
        temperature: 0.7,
        messages: [
          { role: "system", content: system },
          ...filtered,
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ text: data?.error?.message || "Groq API error" });
    }

    const text = data?.choices?.[0]?.message?.content || "Sorry I could not process that!";
    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ text: "Something went wrong: " + err.message });
  }
}

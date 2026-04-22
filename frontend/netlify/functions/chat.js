exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin":  "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  try {
    const body     = JSON.parse(event.body || "{}");
    const messages = body.messages || [];
    const system   = body.system   || "";

    // Filter messages — remove leading assistant messages
    const filtered = messages.filter(m => m.role === "user" || m.role === "assistant");

    // Remove leading assistant messages
    while (filtered.length > 0 && filtered[0].role === "assistant") {
      filtered.shift();
    }

    if (filtered.length === 0) {
      return {
        statusCode: 200,
        headers:    { "Access-Control-Allow-Origin": "*" },
        body:       JSON.stringify({ text: "Please ask me a question about BaseQuest!" }),
      };
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
      return {
        statusCode: response.status,
        headers:    { "Access-Control-Allow-Origin": "*" },
        body:       JSON.stringify({ text: data?.error?.message || "Groq API error" }),
      };
    }

    const text = data?.choices?.[0]?.message?.content
      || "Sorry I could not process that!";

    return {
      statusCode: 200,
      headers: {
        "Content-Type":                "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ text }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers:    { "Access-Control-Allow-Origin": "*" },
      body:       JSON.stringify({ text: "Something went wrong: " + err.message }),
    };
  }
};

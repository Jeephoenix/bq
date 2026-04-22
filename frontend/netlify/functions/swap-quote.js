exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin":  "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
      body: "",
    };
  }

  try {
    const p = event.queryStringParameters || {};

    // ── Token list request ─────────────────────────────────────────────
    if (p.type === "tokens") {
      const sources = [
        "https://tokens.uniswap.org",
        "https://raw.githubusercontent.com/Uniswap/default-token-list/main/src/tokens/base.json",
        "https://raw.githubusercontent.com/base-org/tokenlists/main/src/base.tokenlist.json",
      ];

      for (const url of sources) {
        try {
          const res  = await fetch(url);
          if (!res.ok) continue;
          const data = await res.json();
          const list = data?.tokens || (Array.isArray(data) ? data : []);
          const base = list.filter(t => !t.chainId || t.chainId === 8453);
          if (base.length > 0) {
            return {
              statusCode: 200,
              headers: {
                "Content-Type":                "application/json",
                "Access-Control-Allow-Origin": "*",
              },
              body: JSON.stringify({ tokens: base }),
            };
          }
        } catch { continue; }
      }

      // All sources failed — return empty
      return {
        statusCode: 200,
        headers:    { "Access-Control-Allow-Origin": "*" },
        body:       JSON.stringify({ tokens: [] }),
      };
    }

    // ── Quote request ──────────────────────────────────────────────────
    if (!p.sellToken || !p.buyToken || !p.sellAmount) {
      return {
        statusCode: 400,
        headers:    { "Access-Control-Allow-Origin": "*" },
        body:       JSON.stringify({ error: "Missing required params: sellToken, buyToken, sellAmount" }),
      };
    }

    const params = new URLSearchParams({
      chainId:     "8453",
      sellToken:   p.sellToken,
      buyToken:    p.buyToken,
      sellAmount:  p.sellAmount,
      slippageBps: p.slippageBps || "50",
      taker:       p.taker || "0x0000000000000000000000000000000000000001",
    });

    const url = `https://api.0x.org/swap/allowance-holder/quote?${params}`;

    const res = await fetch(url, {
      headers: {
        "0x-api-key":   process.env.VITE_0X_API_KEY,
        "0x-version":   "v2",
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    return {
      statusCode: res.status,
      headers: {
        "Content-Type":                "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers:    { "Access-Control-Allow-Origin": "*" },
      body:       JSON.stringify({ error: err.message }),
    };
  }
};

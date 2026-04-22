export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const p = req.query || {};

    if (p.type === "tokens") {
      const sources = [
        "https://tokens.uniswap.org",
        "https://raw.githubusercontent.com/Uniswap/default-token-list/main/src/tokens/base.json",
        "https://raw.githubusercontent.com/base-org/tokenlists/main/src/base.tokenlist.json",
      ];

      for (const url of sources) {
        try {
          const r    = await fetch(url);
          if (!r.ok) continue;
          const data = await r.json();
          const list = data?.tokens || (Array.isArray(data) ? data : []);
          const base = list.filter(t => !t.chainId || t.chainId === 8453);
          if (base.length > 0) {
            return res.status(200).json({ tokens: base });
          }
        } catch { continue; }
      }

      return res.status(200).json({ tokens: [] });
    }

    if (!p.sellToken || !p.buyToken || !p.sellAmount) {
      return res.status(400).json({ error: "Missing required params: sellToken, buyToken, sellAmount" });
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

    const r = await fetch(url, {
      headers: {
        "0x-api-key":   process.env.VITE_0X_API_KEY,
        "0x-version":   "v2",
        "Content-Type": "application/json",
      },
    });

    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

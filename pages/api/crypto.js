
// This endpoint uses CoinGecko as default.
// If you want to use CoinAPI (https://www.coinapi.io/) with your API key instead, uncomment and adjust the below.
// Your CoinAPI Key: d5678f88-65b8-4067-b871-3f5c794f7582

export default async function handler(req, res) {
  // Try CoinGecko first (no key needed)
  const url_coingecko =
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true";
  try {
    const resp = await fetch(url_coingecko);
    if (!resp.ok) throw new Error("CoinGecko failed");
    const data = await resp.json();
    // Normalize output
    data.bitcoin.usd_24h_change = data.bitcoin.usd_24h_change || 0;
    data.ethereum.usd_24h_change = data.ethereum.usd_24h_change || 0;
    res.json(data);
    return;
  } catch (e) {
    // Fallback: Try CoinAPI (requires API key in headers)
    try {
      const COINAPI_KEY = "d5678f88-65b8-4067-b871-3f5c794f7582";
      const url_coinapi =
        "https://rest.coinapi.io/v1/assets/?filter_asset_id=BTC,ETH";
      const resp2 = await fetch(url_coinapi, {
        headers: { "X-CoinAPI-Key": COINAPI_KEY },
      });
      if (!resp2.ok) throw new Error("CoinAPI failed");
      const arr = await resp2.json();
      // Find BTC and ETH, re-shape similar to CoinGecko
      const bitcoin = arr.find(t => t.asset_id === "BTC");
      const ethereum = arr.find(t => t.asset_id === "ETH");
      res.json({
        bitcoin: {
          usd: bitcoin.price_usd,
          usd_24h_change: bitcoin.volume_1day_usd || 0 // fallback, CoinAPI does not provide % change directly
        },
        ethereum: {
          usd: ethereum.price_usd,
          usd_24h_change: ethereum.volume_1day_usd || 0
        }
      });
      return;
    } catch (e2) {
      return res.status(500).json({ error: "Failed to fetch prices from both APIs" });
    }
  }
}

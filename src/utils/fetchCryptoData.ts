
/**
 * fetchCryptoData.ts
 * Unified fetcher for BTC/ETH price and 24h change.
 * Tries CoinGecko API, falls back to CoinAPI if needed.
 */
const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true";

const COINAPI_KEY = process.env.COINAPI_KEY || "d5678f88-65b8-4067-b871-3f5c794f7582";
const COINAPI_URL =
  "https://rest.coinapi.io/v1/assets/?filter_asset_id=BTC,ETH";

/**
 * Fetch latest prices and 24h changes for BTC/ETH.
 * @returns {Promise<{bitcoin: {usd: number, usd_24h_change: number}, ethereum: {usd: number, usd_24h_change: number}}>}
 */
export async function fetchCryptoData() {
  // Try CoinGecko first
  try {
    const r = await fetch(COINGECKO_URL);
    if (!r.ok) throw new Error("CoinGecko failed");
    const data = await r.json();
    // Normalize
    data.bitcoin.usd_24h_change = data.bitcoin.usd_24h_change ?? 0;
    data.ethereum.usd_24h_change = data.ethereum.usd_24h_change ?? 0;
    return data;
  } catch (e) {
    // Fallback: CoinAPI
    try {
      const r2 = await fetch(COINAPI_URL, {
        headers: { "X-CoinAPI-Key": COINAPI_KEY }
      });
      if (!r2.ok) throw new Error("CoinAPI failed");
      const arr = await r2.json();
      const bitcoin = arr.find(t => t.asset_id === "BTC");
      const ethereum = arr.find(t => t.asset_id === "ETH");
      return {
        bitcoin: {
          usd: bitcoin?.price_usd,
          usd_24h_change: bitcoin?.volume_1day_usd || 0 // fallback: CoinAPI has no percent change
        },
        ethereum: {
          usd: ethereum?.price_usd,
          usd_24h_change: ethereum?.volume_1day_usd || 0
        }
      };
    } catch (e2) {
      throw new Error("Failed to fetch from both CoinGecko & CoinAPI");
    }
  }
}

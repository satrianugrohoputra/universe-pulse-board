
import useSWR from "swr";
const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true";

// CoinAPI settings (fallback, not needed unless CoinGecko fails, and requires a key)
const COINAPI_KEY = "d5678f88-65b8-4067-b871-3f5c794f7582";
const COINAPI_URL =
  "https://rest.coinapi.io/v1/assets/?filter_asset_id=BTC,ETH";

const fetcher = async url => {
  // Try CoinGecko, then fallback to CoinAPI
  try {
    const resp = await fetch(COINGECKO_URL);
    if (!resp.ok) throw new Error("CoinGecko failed");
    const data = await resp.json();
    // Normalize output
    data.bitcoin.usd_24h_change = data.bitcoin.usd_24h_change || 0;
    data.ethereum.usd_24h_change = data.ethereum.usd_24h_change || 0;
    return data;
  } catch {
    try {
      const resp2 = await fetch(COINAPI_URL, {
        headers: { "X-CoinAPI-Key": COINAPI_KEY },
      });
      if (!resp2.ok) throw new Error("CoinAPI failed");
      const arr = await resp2.json();
      const bitcoin = arr.find(t => t.asset_id === "BTC");
      const ethereum = arr.find(t => t.asset_id === "ETH");
      return {
        bitcoin: {
          usd: bitcoin.price_usd,
          usd_24h_change: bitcoin.volume_1day_usd || 0
        },
        ethereum: {
          usd: ethereum.price_usd,
          usd_24h_change: ethereum.volume_1day_usd || 0
        }
      };
    } catch {
      throw new Error("Failed to fetch prices from both APIs");
    }
  }
};

export default function CryptoCard() {
  const { data, error, isLoading } = useSWR(COINGECKO_URL, fetcher, { refreshInterval: 60000 });
  if (isLoading) {
    return (
      <div className="rounded-xl shadow-md p-4 bg-white/10 border border-white/20 min-h-[10rem]">
        <div className="animate-pulse h-10 w-2/3 bg-white/10 mb-3 rounded" />
        <div className="h-4 w-1/2 bg-white/10 rounded" />
      </div>
    );
  }
  if (error || !data) {
    return <div className="rounded-xl shadow-md p-4 bg-white/10 border border-white/20">Error loading prices</div>;
  }
  const { bitcoin, ethereum } = data;
  return (
    <div className="rounded-xl shadow-md p-4 bg-white/10 border border-white/20 flex flex-col justify-between min-h-[10rem]">
      <div className="flex gap-8">
        <div>
          <div className="text-white font-bold text-lg flex items-center gap-2">BTC
            {bitcoin.usd_24h_change > 0 ? (
              <span className="ml-1 text-green-400">↑</span>
            ) : (
              <span className="ml-1 text-red-400">↓</span>
            )}
          </div>
          <div className="text-cyan-300 text-lg">${bitcoin.usd}</div>
          <div className={bitcoin.usd_24h_change >= 0 ? "text-green-400" : "text-red-400"}>
            {bitcoin.usd_24h_change.toFixed(2)}%
          </div>
        </div>
        <div>
          <div className="text-white font-bold text-lg flex items-center gap-2">ETH
            {ethereum.usd_24h_change > 0 ? (
              <span className="ml-1 text-green-400">↑</span>
            ) : (
              <span className="ml-1 text-red-400">↓</span>
            )}
          </div>
          <div className="text-cyan-300 text-lg">${ethereum.usd}</div>
          <div className={ethereum.usd_24h_change >= 0 ? "text-green-400" : "text-red-400"}>
            {ethereum.usd_24h_change.toFixed(2)}%
          </div>
        </div>
      </div>
      <div className="text-xs text-cyan-100 opacity-80 mt-2">Prices via CoinGecko. Updates every min.</div>
    </div>
  );
}

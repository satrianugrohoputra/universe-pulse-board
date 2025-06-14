
import useSWR from "swr";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useState } from "react";

// Timeframes for charting
const timeframes = [
  { key: "1", label: "1HR", days: "1", interval: "hourly" },
  { key: "1d", label: "1D", days: "1", interval: "hourly" },
  { key: "7", label: "1W", days: "7", interval: "daily" },
  { key: "30", label: "1M", days: "30", interval: "daily" },
  { key: "365", label: "1Y", days: "365", interval: "daily" },
  { key: "max", label: "MAX", days: "max", interval: "daily" }
];

// Supported coins
const coins = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" }
];

// Fetcher with error handling
const fetcher = async (url) => {
  console.log("[CryptoCard] Fetching:", url);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
  return response.json();
};

/**
 * Chart only - still pulls from CoinGecko for historic data
 */
function CryptoChart({ coin, timeframe }) {
  const { data, error, isLoading } = useSWR(
    `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=${timeframe.days}&interval=${timeframe.interval}`,
    fetcher,
    { 
      refreshInterval: 60000,
      onError: (error) => {
        console.error("SWR error for chart data:", error);
      }
    }
  );

  if (isLoading) {
    return (
      <div className="w-full h-64 bg-black/20 rounded-lg flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full" />
          <div className="text-cyan-300 text-sm">Loading chart...</div>
        </div>
      </div>
    );
  }

  if (error || !data?.prices || !Array.isArray(data.prices) || data.prices.length === 0) {
    return (
      <div className="w-full h-64 bg-black/20 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-sm mb-2">Failed to load chart data</div>
          <div className="text-xs text-white/60">
            {error?.message || "Chart API error"}
          </div>
        </div>
      </div>
    );
  }

  const chartData = data.prices.map(([timestamp, price], index) => ({
    time: timeframe.days === "1" 
      ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    price: price,
    timestamp: timestamp
  }));

  return (
    <div className="w-full">
      <div className="w-full h-64 bg-black/20 rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={['dataMin * 0.95', 'dataMax * 1.05']}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid #06b6d4',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#ffffff'
              }}
              formatter={(value) => [`$${value.toLocaleString()}`, "USD"]}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#0ff"
              strokeWidth={2}
              dot={false}
              strokeLinecap="round"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/**
 * NEW: Top section fetches current price & 24h change from /api/crypto (proxy w/ CoinAPI fallback)
 */
function CryptoCard() {
  const [selectedCoin, setSelectedCoin] = useState(coins[0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframes[1]);

  // Server data (current price, % 24h) from proxy endpoint with CoinGecko + CoinAPI fallback
  const { data: currentData, error: priceError, isLoading: priceLoading } = useSWR(
    "/api/crypto",
    fetcher,
    {
      refreshInterval: 60000,
      onError: (err) => {
        console.error("[CryptoCard] /api/crypto error:", err);
      }
    }
  );

  // Extract current+24h data
  let price = null, change = null, isChangePositive = null;
  if (currentData && currentData[selectedCoin.id]) {
    price = currentData[selectedCoin.id].usd;
    change = currentData[selectedCoin.id].usd_24h_change;
    isChangePositive = typeof change === "number" ? change >= 0 : null;
  }

  return (
    <div className="rounded-xl shadow-md p-4 bg-white/10 border border-white/20 min-h-[24rem]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-white text-lg">Cryptocurrency Pulse</h2>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      </div>
      <div className="flex gap-2 mb-6">
        {coins.map((coin) => (
          <button
            key={coin.id}
            onClick={() => setSelectedCoin(coin)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedCoin.id === coin.id
                ? 'bg-cyan-600 text-white shadow-lg'
                : 'bg-black/30 text-cyan-300 hover:bg-black/50'
            }`}
          >
            {coin.symbol}
          </button>
        ))}
      </div>
      {/* Price + 24h change area */}
      <div className="mb-4 text-center min-h-[56px]">
        {priceLoading ? (
          <div className="flex flex-col gap-2 items-center">
            <div className="animate-pulse bg-cyan-400/40 h-8 w-32 rounded" />
            <div className="animate-pulse bg-cyan-500/30 h-5 w-16 rounded" />
          </div>
        ) : priceError || price == null ? (
          <div>
            <div className="text-red-400 font-semibold text-lg">Failed to load price</div>
            <div className="text-xs text-white/60">Server or API error</div>
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold text-cyan-300">
              ${typeof price === "number" ? price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "?"}
            </div>
            <div className={`text-sm font-medium ${isChangePositive ? 'text-green-400' : 'text-red-400'}`}>
              {isChangePositive ? "+" : ""}{typeof change === "number" ? change.toFixed(2) : "?"}% (24h)
            </div>
          </>
        )}
      </div>
      {/* Chart */}
      <CryptoChart coin={selectedCoin} timeframe={selectedTimeframe} />
      {/* Timeframe picker */}
      <div className="flex gap-2 mt-6 justify-center flex-wrap">
        {timeframes.map((timeframe) => (
          <button
            key={timeframe.key}
            onClick={() => setSelectedTimeframe(timeframe)}
            className={`px-3 py-1 rounded text-xs font-medium transition-all duration-200 ${
              selectedTimeframe.key === timeframe.key
                ? 'bg-cyan-600 text-white shadow-lg border-2 border-cyan-400'
                : 'bg-black/30 text-cyan-300 hover:bg-black/50 border border-transparent'
            }`}
          >
            {timeframe.label}
          </button>
        ))}
      </div>
      <div className="text-xs text-cyan-100 opacity-80 mt-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <span>Realtime Price: API (CoinGecko→CoinAPI)</span>
          <span>•</span>
          <span>Chart: CoinGecko</span>
          <span>•</span>
          <span>Updates every minute</span>
          <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse ml-1" />
        </div>
      </div>
    </div>
  );
}

export default CryptoCard;

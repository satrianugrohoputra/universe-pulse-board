
import useSWR from "swr";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useState } from "react";
import { fetchCryptoData } from "../src/utils/fetchCryptoData";

// CoinGecko requires interval=hourly for <=90 days, daily for longer.
const timeframes = [
  { key: "1h", label: "1HR", days: "1", interval: "hourly" },
  { key: "1d", label: "1D", days: "1", interval: "hourly" },
  { key: "7d", label: "1W", days: "7", interval: "hourly" }, // hourly for 7D!
  { key: "1m", label: "1M", days: "30", interval: "daily" },
  { key: "1y", label: "1Y", days: "365", interval: "daily" },
];

// Supported coins
const coins = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" }
];

// Fetcher for historic chart (CoinGecko direct, no proxy!)
const fetcher = async (url) => {
  console.log("[CryptoCard] Fetching:", url);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
  return response.json();
};

/**
 * Chart only - CoinGecko for historic data (limited)
 */
function CryptoChart({ coin, timeframe }) {
  // CoinGecko API doesn't support >1095 days (3 years), we block max.
  const blockApiMax = parseInt(timeframe.days) > 1095;

  // Build the proper interval based on selected timeframe.
  let interval = timeframe.interval;
  // Safety logic: for up to 90 days, CoinGecko will return hourly data on interval=hourly, otherwise must be daily.
  if (parseInt(timeframe.days) > 90) {
    interval = "daily";
  }

  // CoinGecko sometimes returns very few points for some intervals, but this gets maximal points.
  const chartUrl = !blockApiMax
    ? `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=${timeframe.days}&interval=${interval}`
    : null;

  const chartDataSWR = useSWR(
    chartUrl,
    fetcher,
    {
      refreshInterval: 60000,
      onError: (error) => {
        console.error("SWR error for chart data:", error);
      }
    }
  );
  const { data, error, isLoading } = chartDataSWR;

  // Show visible warning if timeframe not supported.
  if (blockApiMax) {
    return (
      <div className="w-full h-40 bg-black/20 rounded-lg flex flex-col items-center justify-center gap-2 p-4">
        <div className="text-yellow-400 font-semibold text-sm">Timeframe not available</div>
        <div className="text-xs text-white/70 text-center">
          Due to CoinGecko API limits, charts beyond 1 year require a paid plan. Please select a shorter range.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-40 bg-black/20 rounded-lg flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full" />
          <div className="text-cyan-300 text-xs">Loading chart...</div>
        </div>
      </div>
    );
  }

  if (error || !data?.prices || !Array.isArray(data.prices) || data.prices.length === 0) {
    return (
      <div className="w-full h-40 bg-black/20 rounded-lg flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-400 text-sm mb-2">Failed to load chart data</div>
          <div className="text-xs text-white/60">
            {error?.message || "Chart API error"}
          </div>
        </div>
      </div>
    );
  }

  // Chart data: pick best label by timeframe.
  const chartData = data.prices.map(([timestamp, price]) => {
    const date = new Date(timestamp);

    let timeLabel = "";
    if (timeframe.key === "1h" || timeframe.key === "1d") {
      timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (timeframe.key === "7d") {
      // Show both date and hour for more context
      timeLabel = date.toLocaleDateString([], { weekday: 'short', day: 'numeric' }) + ' ' + date.toLocaleTimeString([], {hour: '2-digit'});
    } else {
      timeLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    return {
      time: timeLabel,
      price,
      timestamp
    };
  });

  // If CoinGecko only returned 1 value, don't even render chart
  if (!chartData || chartData.length < 2) {
    return (
      <div className="w-full h-40 bg-black/20 rounded-lg flex items-center justify-center p-4">
        <div className="text-cyan-200/80 text-center text-xs">
          Not enough data for chart (CoinGecko API).<br/>
          Try a different timeframe.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-40 bg-black/20 rounded-lg p-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: '#94a3b8' }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={['dataMin * 0.98', 'dataMax * 1.02']}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: '#94a3b8' }}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid #06b6d4',
              borderRadius: '8px',
              fontSize: '11px',
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
  );
}

function CryptoCard() {
  const [selectedCoin, setSelectedCoin] = useState(coins[0]);
  // Set default to "1D"
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframes[1]);
  const [fallbackSource, setFallbackSource] = useState(null);

  // Server data (current price, % 24h) uses fetchCryptoData util
  const {
    data: currentData,
    error: priceError,
    isLoading: priceLoading
  } = useSWR(
    "crypto-prices-vite",
    async () => {
      try {
        const dat = await fetchCryptoData();
        setFallbackSource("CoinGecko");
        return dat;
      } catch (e) {
        // If fetchCryptoData throws, means both failed
        setFallbackSource("CoinAPI (fallback)");
        throw e;
      }
    },
    {
      refreshInterval: 60000,
      onError: (err) => {
        setFallbackSource("Unavailable");
        console.error("[CryptoCard] crypto data error:", err);
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
    <div className="rounded-xl shadow-md p-4 bg-white/10 border border-white/20 min-h-[26rem] h-[26rem] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-white text-lg truncate">Cryptocurrency Pulse</h2>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
      </div>
      
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {coins.map((coin) => (
          <button
            key={coin.id}
            onClick={() => setSelectedCoin(coin)}
            className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 flex-shrink-0 text-sm ${
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
      <div className="mb-4 text-center min-h-[48px] flex flex-col justify-center">
        {priceLoading ? (
          <div className="flex flex-col gap-2 items-center">
            <div className="animate-pulse bg-cyan-400/40 h-6 w-24 rounded" />
            <div className="animate-pulse bg-cyan-500/30 h-4 w-16 rounded" />
          </div>
        ) : priceError || price == null ? (
          <div className="px-2">
            <div className="text-red-400 font-semibold text-base">Failed to load price</div>
            <div className="text-xs text-white/60 break-words">Data source: {fallbackSource || "Unknown"}<br />Server/API error</div>
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold text-cyan-300 break-words">
              ${typeof price === "number" ? price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "?"}
            </div>
            <div className={`text-sm font-medium ${isChangePositive ? 'text-green-400' : 'text-red-400'}`}>
              {isChangePositive ? "+" : ""}{typeof change === "number" ? change.toFixed(2) : "?"}% (24h)
            </div>
          </>
        )}
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0 mb-4">
        <CryptoChart coin={selectedCoin} timeframe={selectedTimeframe} />
      </div>

      {/* Timeframe picker */}
      <div className="flex gap-1 justify-center flex-wrap mb-3">
        {timeframes.map((timeframe) => (
          <button
            key={timeframe.key}
            onClick={() => setSelectedTimeframe(timeframe)}
            className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
              selectedTimeframe.key === timeframe.key
                ? 'bg-cyan-600 text-white shadow-lg border-2 border-cyan-400'
                : 'bg-black/30 text-cyan-300 hover:bg-black/50 border border-transparent'
            }`}
            title=""
          >
            {timeframe.label}
          </button>
        ))}
      </div>

      <div className="text-xs text-cyan-100 opacity-80 text-center">
        <div className="flex items-center justify-center gap-1 flex-wrap">
          <span className="whitespace-nowrap">Realtime: {fallbackSource || "API"}</span>
          <span>•</span>
          <span className="whitespace-nowrap">Chart: CoinGecko</span>
          <span>•</span>
          <span className="whitespace-nowrap">Updates/min</span>
          <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse ml-1 flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}

export default CryptoCard;

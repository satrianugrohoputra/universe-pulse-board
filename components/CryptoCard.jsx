
import useSWR from "swr";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true";

const SPARKLINE_URL = 
  "https://api.coingecko.com/api/v3/coins/bitcoin,ethereum/market_chart?vs_currency=usd&days=1&interval=hourly";

const fetcher = async url => {
  try {
    const resp = await fetch(COINGECKO_URL);
    if (!resp.ok) throw new Error("CoinGecko failed");
    const data = await resp.json();
    
    // Also fetch sparkline data
    const btcSparkline = await fetch(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1&interval=hourly`);
    const ethSparkline = await fetch(`https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=1&interval=hourly`);
    
    const btcChart = btcSparkline.ok ? await btcSparkline.json() : null;
    const ethChart = ethSparkline.ok ? await ethSparkline.json() : null;
    
    // Normalize output
    data.bitcoin.usd_24h_change = data.bitcoin.usd_24h_change || 0;
    data.ethereum.usd_24h_change = data.ethereum.usd_24h_change || 0;
    
    // Add sparkline data
    if (btcChart?.prices) {
      data.bitcoin.sparkline = btcChart.prices.map(([timestamp, price], index) => ({
        time: index,
        price: price
      }));
    }
    
    if (ethChart?.prices) {
      data.ethereum.sparkline = ethChart.prices.map(([timestamp, price], index) => ({
        time: index,
        price: price
      }));
    }
    
    return data;
  } catch {
    throw new Error("Failed to fetch crypto data");
  }
};

function SparklineChart({ data, isPositive }) {
  if (!data || data.length < 2) {
    return <div className="w-20 h-8 bg-white/10 rounded animate-pulse" />;
  }

  return (
    <div className="w-20 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="price"
            stroke={isPositive ? "#10b981" : "#ef4444"}
            strokeWidth={1.5}
            dot={false}
            strokeLinecap="round"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function CryptoItem({ name, symbol, price, change, sparklineData }) {
  const isPositive = change >= 0;
  const formattedPrice = typeof price === 'number' ? price.toLocaleString() : price;
  
  return (
    <div className={`p-3 rounded-lg border transition-all duration-300 ${
      isPositive 
        ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20' 
        : 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="text-white font-bold text-lg">{symbol}</div>
          <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-green-400' : 'bg-red-400'}`} />
        </div>
        <div className={`text-xs font-medium px-2 py-1 rounded ${
          isPositive 
            ? 'bg-green-500/20 text-green-300' 
            : 'bg-red-500/20 text-red-300'
        }`}>
          {isPositive ? '+' : ''}{change.toFixed(2)}%
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <div className="text-cyan-300 text-xl font-bold">${formattedPrice}</div>
          <div className="text-white/60 text-xs">{name}</div>
        </div>
        <SparklineChart data={sparklineData} isPositive={isPositive} />
      </div>
      
      <div className="flex items-center gap-1 mt-2">
        <span className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? '↗' : '↘'} 24h
        </span>
      </div>
    </div>
  );
}

export default function CryptoCard() {
  const { data, error, isLoading } = useSWR(COINGECKO_URL, fetcher, { 
    refreshInterval: 60000,
    revalidateOnFocus: false 
  });
  
  if (isLoading) {
    return (
      <div className="rounded-xl shadow-md p-4 bg-white/10 border border-white/20 min-h-[20rem]">
        <h2 className="font-bold text-white mb-4 text-lg">Cryptocurrency Pulse</h2>
        <div className="space-y-3">
          <div className="animate-pulse h-20 bg-white/10 rounded-lg" />
          <div className="animate-pulse h-20 bg-white/10 rounded-lg" />
        </div>
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="rounded-xl shadow-md p-4 bg-white/10 border border-white/20">
        <div className="text-red-400">Error loading cryptocurrency prices</div>
      </div>
    );
  }
  
  const { bitcoin, ethereum } = data;
  
  return (
    <div className="rounded-xl shadow-md p-4 bg-white/10 border border-white/20 min-h-[20rem]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-white text-lg">Cryptocurrency Pulse</h2>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      </div>
      
      <div className="space-y-3">
        <CryptoItem
          name="Bitcoin"
          symbol="BTC"
          price={bitcoin.usd}
          change={bitcoin.usd_24h_change}
          sparklineData={bitcoin.sparkline}
        />
        
        <CryptoItem
          name="Ethereum"
          symbol="ETH"
          price={ethereum.usd}
          change={ethereum.usd_24h_change}
          sparklineData={ethereum.sparkline}
        />
      </div>
      
      <div className="text-xs text-cyan-100 opacity-80 mt-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <span>Powered by CoinGecko</span>
          <span>•</span>
          <span>Updates every minute</span>
          <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse ml-1" />
        </div>
      </div>
    </div>
  );
}

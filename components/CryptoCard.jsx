
import { useEffect, useState } from "react";
import useSWR from "swr";

const fetcher = url => fetch(url).then(r => r.json());

export default function CryptoCard() {
  const { data, error, isLoading } = useSWR("/api/crypto", fetcher, { refreshInterval: 60000 });
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

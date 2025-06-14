
import { useState, useEffect } from "react";
import useSWR from "swr";

const NASA_API_KEY = "tBkTBc95GoLSAScjXeOIdxDjAbASfuR9b6M8oBCR";
const fetcher = url => fetch(url).then(res => res.json());

export default function EPICCard() {
  const { data, error, isLoading } = useSWR(
    `https://api.nasa.gov/EPIC/api/natural/images?api_key=${NASA_API_KEY}`,
    fetcher
  );
  const [index, setIndex] = useState(0);
  const [modal, setModal] = useState(false);
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    if (!data || data.length === 0) return;
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % Math.min(data.length, 5));
    }, 6000); 
    return () => clearInterval(interval);
  }, [data]);

  if (isLoading) {
    return (
      <div className="rounded-xl shadow-md p-4 bg-white/10 border border-white/20 flex flex-col min-h-[24rem] h-[24rem]">
        <div className="animate-pulse rounded-lg bg-white/10 h-48 w-full mb-4" />
        <div className="w-2/3 h-6 bg-white/20 rounded my-2" />
        <div className="w-1/2 h-4 bg-white/10 rounded" />
      </div>
    );
  }

  if (error || !data || !Array.isArray(data) || !data.length) {
    return (
      <div className="rounded-xl shadow-md p-4 bg-white/10 border border-white/20 flex flex-col min-h-[24rem] h-[24rem] items-center justify-center">
        <div className="text-red-400">Failed to load EPIC data.</div>
      </div>
    );
  }

  const last5 = data.slice(-5);
  const img = last5[index];
  const dateParts = img.date.split(" ")[0].split("-");
  const imgUrl = `https://epic.gsfc.nasa.gov/archive/natural/${dateParts.join("/")}/jpg/${img.image}.jpg`;

  return (
    <div className="rounded-xl shadow-md p-4 bg-white/10 border border-white/20 relative flex flex-col min-h-[24rem] h-[24rem]">
      <div
        className="w-full h-48 rounded-lg overflow-hidden cursor-pointer relative group"
        onClick={() => setModal(true)}
      >
        <img
          src={imgUrl}
          alt={img.caption.slice(0,40)}
          className={`w-full h-full object-cover transition-all duration-1000 hover:scale-105 ${isRotating ? 'animate-spin' : ''}`}
          style={{
            animationDuration: isRotating ? '120s' : '0s',
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="text-sm font-semibold mb-1">🌍 Earth from Space</div>
            <div className="text-xs opacity-80">Click to explore full size</div>
          </div>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            className={`p-2 rounded text-xs font-medium transition-colors ${
              isRotating 
                ? 'bg-cyan-600 text-white hover:bg-cyan-700' 
                : 'bg-black/60 text-white hover:bg-black/80'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setIsRotating(!isRotating);
            }}
          >
            {isRotating ? '⏸️' : '▶️'}
          </button>
          <button
            aria-label="Previous"
            className="bg-black/60 hover:bg-cyan-600 text-white p-1 rounded"
            onClick={e => { 
              e.stopPropagation(); 
              setIndex((i) => (i - 1 + last5.length) % last5.length); 
            }}
          >
            &larr;
          </button>
          <button
            aria-label="Next"
            className="bg-black/60 hover:bg-cyan-600 text-white p-1 rounded"
            onClick={e => { 
              e.stopPropagation(); 
              setIndex((i) => (i + 1) % last5.length); 
            }}
          >
            &rarr;
          </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-between mt-3 min-h-0">
        <div>
          <div className="font-semibold text-cyan-300 text-sm flex items-center gap-2">
            <span>📅 {img.date}</span>
            {isRotating && <span className="text-xs text-cyan-400 animate-pulse">🔄 Rotating</span>}
          </div>
          <div className="text-white/90 text-xs mt-1">{img.caption}</div>
        </div>
        <div className="text-cyan-200 text-xs mt-2 opacity-70">
          Distance: ~1.5M km • Natural color composite
        </div>
      </div>
      {modal && (
        <div className="fixed inset-0 z-50 backdrop-blur bg-black/90 flex items-center justify-center p-4" onClick={() => setModal(false)}>
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img 
              src={imgUrl} 
              alt={img.caption} 
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border-4 border-cyan-400"
            />
            <button
              className="absolute top-4 right-4 bg-black/70 hover:bg-red-600 text-white p-2 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                setModal(false);
              }}
            >
              ✕
            </button>
            <div className="absolute bottom-4 left-4 right-4 bg-black/80 p-3 rounded-lg">
              <div className="text-cyan-300 font-semibold">{img.date}</div>
              <div className="text-white text-sm mt-1">{img.caption}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

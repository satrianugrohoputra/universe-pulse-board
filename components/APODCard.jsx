
import { useState, useEffect } from "react";
import useSWR from "swr";

const NASA_API_KEY = "tBkTBc95GoLSAScjXeOIdxDjAbASfuR9b6M8oBCR";
const fetcher = url => fetch(url).then(res => res.json());

export default function APODCard() {
  const [expanded, setExpanded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomedImage, setZoomedImage] = useState(null);
  
  // Fetch last 5 days of APOD
  const { data, error, isLoading } = useSWR(
    `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&count=5`,
    fetcher
  );

  useEffect(() => {
    if (!data || data.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % data.length);
    }, 8000); // Slower transition - changed from 4000ms to 8000ms

    return () => clearInterval(interval);
  }, [data]);

  // --- HEIGHT PATCHING 
  // Set to h-[24rem] for visual parity, constrain image area for all cases

  if (isLoading) {
    return (
      <div className="rounded-xl shadow-md p-4 bg-white/10 border border-white/20 relative flex flex-col min-h-[24rem] h-[24rem]">
        <div className="animate-pulse rounded-lg bg-white/10 h-48 w-full mb-4" />
        <div className="w-2/3 h-6 bg-white/20 rounded mb-2" />
        <div className="w-1/2 h-4 bg-white/10 rounded" />
      </div>
    );
  }

  if (error || !data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="rounded-xl shadow-md p-4 bg-white/10 border border-white/20 relative flex flex-col min-h-[24rem] h-[24rem] items-center justify-center">
        <div className="text-red-400">Error loading Astronomy Picture of the Day.</div>
      </div>
    );
  }

  const currentAPOD = data[currentIndex];

  return (
    <div className="rounded-xl shadow-md p-4 bg-white/10 border border-white/20 relative flex flex-col min-h-[24rem] h-[24rem] overflow-hidden">
      {/* Back to Dashboard Button */}
      <button
        className="absolute top-4 left-4 z-20 bg-black/70 hover:bg-cyan-600 text-white p-2 rounded-lg text-xs font-medium transition-colors"
        onClick={() => window.location.reload()}
      >
        ← Dashboard
      </button>

      <div className="relative" style={{ minHeight: "12rem", height: "12rem", maxHeight: "12rem" }}>
        {currentAPOD.media_type === "image" ? (
          <img 
            src={currentAPOD.url} 
            alt={currentAPOD.title} 
            className="w-full h-full object-cover rounded-lg shadow mb-2 transition-opacity duration-500 cursor-pointer hover:opacity-90" 
            onClick={() => setZoomedImage(currentAPOD.url)}
          />
        ) : (
          <div className="w-full aspect-video h-full mb-2 rounded-lg overflow-hidden bg-black/80 flex items-center justify-center">
            <iframe
              src={currentAPOD.url}
              title={currentAPOD.title}
              frameBorder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        )}
        {/* Image counter and navigation */}
        <div className="absolute top-3 right-3 flex gap-2">
          <div className="bg-black/60 px-2 py-1 rounded text-xs text-white">
            {currentIndex + 1}/{data.length}
          </div>
          <button
            className="bg-black/60 hover:bg-cyan-600 text-white p-1 rounded text-xs"
            onClick={() => setCurrentIndex((prev) => (prev - 1 + data.length) % data.length)}
          >
            ←
          </button>
          <button
            className="bg-black/60 hover:bg-cyan-600 text-white p-1 rounded text-xs"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % data.length)}
          >
            →
          </button>
        </div>
        <div className="absolute left-4 top-6 bg-black/60 px-3 py-1 rounded-lg font-semibold text-lg text-white shadow max-w-[60%]">
          {currentAPOD.title}
        </div>
        {/* Date indicator */}
        <div className="absolute left-4 bottom-3 bg-cyan-600/80 px-2 py-1 rounded text-xs text-white font-medium">
          {new Date(currentAPOD.date).toLocaleDateString()}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-between pt-2">
        <div className="text-white/90 text-xs">
          {expanded
            ? currentAPOD.explanation
            : currentAPOD.explanation.split(". ").slice(0, 2).join(". ") + "."}
          {!expanded && (
            <button
              className="ml-2 text-cyan-300 underline hover:text-cyan-400 font-medium"
              onClick={() => setExpanded(true)}
            >
              Read more
            </button>
          )}
          {expanded && (
            <button
              className="ml-2 text-cyan-300 underline hover:text-cyan-400 font-medium"
              onClick={() => setExpanded(false)}
            >
              Show less
            </button>
          )}
        </div>
        {/* Dots indicator */}
        <div className="flex justify-center gap-1 mt-2">
          {data.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-cyan-400' : 'bg-white/30'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>

      {/* Zoom Modal */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-50 backdrop-blur bg-black/90 flex items-center justify-center p-4"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img 
              src={zoomedImage} 
              alt="Zoomed APOD" 
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border-4 border-cyan-400"
            />
            <button
              className="absolute top-4 right-4 bg-black/70 hover:bg-red-600 text-white p-2 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                setZoomedImage(null);
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

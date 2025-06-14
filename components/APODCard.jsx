
import { useState, useEffect } from "react";
import useSWR from "swr";

const NASA_API_KEY = "tBkTBc95GoLSAScjXeOIdxDjAbASfuR9b6M8oBCR";
const fetcher = url => fetch(url).then(res => res.json());

export default function APODCard() {
  const [expanded, setExpanded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Fetch last 5 days of APOD
  const { data, error, isLoading } = useSWR(
    `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&count=5`,
    fetcher
  );

  useEffect(() => {
    if (!data || data.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % data.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [data]);

  if (isLoading) {
    return (
      <div className="rounded-xl shadow-md p-4 bg-white/10 border border-white/20 relative flex flex-col min-h-[22rem]">
        <div className="animate-pulse rounded-lg bg-white/10 h-56 w-full mb-4" />
        <div className="w-2/3 h-4 bg-white/20 rounded mb-2" />
        <div className="w-1/2 h-3 bg-white/10 rounded" />
      </div>
    );
  }

  if (error || !data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="rounded-xl shadow-md p-4 bg-white/10 border border-white/20 relative flex flex-col min-h-[22rem]">
        <div className="text-red-400">Error loading Astronomy Picture of the Day.</div>
      </div>
    );
  }

  const currentAPOD = data[currentIndex];

  return (
    <div className="rounded-xl shadow-md p-4 bg-white/10 border border-white/20 relative flex flex-col min-h-[22rem] overflow-hidden">
      <div className="relative flex-1">
        {currentAPOD.media_type === "image" ? (
          <img 
            src={currentAPOD.url} 
            alt={currentAPOD.title} 
            className="w-full h-56 object-cover rounded-lg shadow mb-2 transition-opacity duration-500" 
          />
        ) : (
          <div className="w-full aspect-video h-56 mb-2 rounded-lg overflow-hidden bg-black/80 flex items-center justify-center">
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
        <div className="absolute top-4 right-4 flex gap-2">
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

        <div className="absolute left-4 top-4 bg-black/60 px-3 py-1 rounded-lg font-semibold text-lg text-white shadow max-w-[60%]">
          {currentAPOD.title}
        </div>
        
        {/* Date indicator */}
        <div className="absolute left-4 bottom-20 bg-cyan-600/80 px-2 py-1 rounded text-xs text-white font-medium">
          {new Date(currentAPOD.date).toLocaleDateString()}
        </div>
        
        <div className="mt-auto text-white/90 text-sm pt-2">
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
    </div>
  );
}

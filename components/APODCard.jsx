
import { useState } from "react";
import useSWR from "swr";

const NASA_API_KEY = "tBkTBc95GoLSAScjXeOIdxDjAbASfuR9b6M8oBCR";
const fetcher = url => fetch(url).then(res => res.json());

export default function APODCard() {
  const [expanded, setExpanded] = useState(false);
  const { data, error, isLoading } = useSWR(
    `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`,
    fetcher
  );

  return (
    <div className="rounded-xl shadow-md p-4 bg-white/10 border border-white/20 relative flex flex-col min-h-[22rem]">
      {isLoading && (
        <div className="animate-pulse rounded-lg bg-white/10 h-56 w-full mb-4" />
      )}
      {error && (
        <div className="text-red-400">Error loading APOD.</div>
      )}
      {data && (
        <div className="flex flex-col flex-1">
          {data.media_type === "image" ? (
            <img src={data.url} alt={data.title} className="w-full h-56 object-cover rounded-lg shadow mb-2" />
          ) : (
            <div className="w-full aspect-video h-56 mb-2 rounded-lg overflow-hidden bg-black/80 flex items-center justify-center">
              <iframe
                src={data.url}
                title="Astronomy Picture of the Day"
                frameBorder="0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          )}
          <div className="absolute left-4 top-4 bg-black/60 px-3 py-1 rounded-lg font-semibold text-lg text-white shadow">{data.title}</div>
          <div className="mt-auto text-white/90 text-sm pt-2">
            {expanded
              ? data.explanation
              : data.explanation.split(". ").slice(0, 2).join(". ") + "."}
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
        </div>
      )}
    </div>
  );
}

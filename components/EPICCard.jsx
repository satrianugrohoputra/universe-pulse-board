
import { useState } from "react";
import useSWR from "swr";

function fetcher(url) {
  return fetch(url).then((res) => res.json());
}

export default function EPICCard() {
  const { data, error, isLoading } = useSWR("/api/epic", fetcher);
  const [index, setIndex] = useState(0);
  const [modal, setModal] = useState(false);

  if (isLoading) {
    return (
      <div className="rounded-xl shadow-md p-4 bg-white/10 border border-white/20">
        <div className="animate-pulse rounded-lg bg-white/10 h-56 w-full mb-2" />
        <div className="w-2/3 h-6 bg-white/20 rounded my-2" />
        <div className="w-1/2 h-4 bg-white/10 rounded" />
      </div>
    );
  }

  if (error || !data || !Array.isArray(data) || !data.length) {
    return (
      <div className="rounded-xl shadow-md p-4 bg-white/10 border border-white/20">
        <div className="text-red-400">Failed to load EPIC data.</div>
      </div>
    );
  }

  const last5 = data.slice(-5);
  const img = last5[index];
  const dateParts = img.date.split(" ")[0].split("-");
  const imgUrl = `https://epic.gsfc.nasa.gov/archive/natural/${dateParts.join("/")}/jpg/${img.image}.jpg`;

  return (
    <div className="rounded-xl shadow-md p-4 bg-white/10 border border-white/20 relative">
      <div
        className="w-full h-56 rounded-lg overflow-hidden cursor-pointer relative"
        onClick={() => setModal(true)}
      >
        <img
          src={imgUrl}
          alt={img.caption.slice(0,40)}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <button
            aria-label="Previous"
            className="bg-black/50 hover:bg-cyan-600 text-white p-1 rounded"
            onClick={e => { e.stopPropagation(); setIndex((i) => (i - 1 + last5.length) % last5.length); }}
          >
            &larr;
          </button>
          <button
            aria-label="Next"
            className="bg-black/50 hover:bg-cyan-600 text-white p-1 rounded"
            onClick={e => { e.stopPropagation(); setIndex((i) => (i + 1) % last5.length); }}
          >
            &rarr;
          </button>
        </div>
      </div>
      <div className="mt-3">
        <div className="font-semibold text-cyan-300 text-sm">{img.date}</div>
        <div className="text-white/90 text-xs mt-1">{img.caption}</div>
      </div>
      {modal && (
        <div className="fixed inset-0 z-50 backdrop-blur bg-black/90 flex items-center justify-center" onClick={() => setModal(false)}>
          <img src={imgUrl} alt={img.caption} className="max-h-[80vh] max-w-[90vw] rounded-xl shadow-xl border-4 border-cyan-400" />
        </div>
      )}
    </div>
  );
}

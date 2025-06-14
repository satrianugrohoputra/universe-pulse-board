
import { useEffect, useState } from "react";

const moods = [
  { val: "happy", emoji: "😄", label: "Happy" },
  { val: "calm", emoji: "😌", label: "Calm" },
  { val: "stressed", emoji: "😩", label: "Stressed" },
  { val: "inspired", emoji: "🚀", label: "Inspired" }
];

function getTodayKey() {
  return "mood-" + new Date().toISOString().slice(0, 10);
}

export default function MoodJournal() {
  const [mood, setMood] = useState("");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(getTodayKey());
    if (saved) setSaved(JSON.parse(saved));
  }, []);

  function onSubmit(e) {
    e.preventDefault();
    const entry = { mood, note };
    localStorage.setItem(getTodayKey(), JSON.stringify(entry));
    setSaved(entry);
  }

  return (
    <div id="journal" className="rounded-xl shadow-md p-4 bg-white/10 border border-white/20 flex flex-col">
      <h2 className="font-bold mb-2 text-white">Mood & Reflection Journal</h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          Mood:
          {moods.map(m => (
            <button
              type="button"
              key={m.val}
              className={`text-2xl hover:scale-110 transition border-2 rounded-full px-1 ${
                mood === m.val
                  ? "border-accent bg-accent/30"
                  : "border-transparent"
              }`}
              onClick={() => setMood(m.val)}
              tabIndex={0}
              aria-label={m.label}
            >
              {m.emoji}
            </button>
          ))}
        </div>
        <textarea
          className="resize-none bg-black/20 border border-accent focus:border-accent focus:ring-accent rounded p-2 text-white placeholder:text-white/60"
          maxLength={200}
          rows={3}
          placeholder="What's on your mind today?"
          value={note}
          onChange={e => setNote(e.target.value)}
        />
        <button
          className="self-end bg-accent px-4 py-1.5 rounded text-black font-semibold hover:bg-cyan-400/80 transition focus:outline-accent"
          type="submit"
          disabled={!mood}
        >
          Save
        </button>
      </form>
      {saved && (
        <div className="mt-4 p-2 rounded-lg bg-black/30 border border-accent/50">
          <div className="flex items-center gap-2 text-lg">
            <span>{moods.find(m => m.val === saved.mood)?.emoji}</span>
            <span className="font-semibold">{moods.find(m => m.val === saved.mood)?.label}</span>
          </div>
          <div className="mt-1 text-white/80 text-sm break-words">
            {saved.note}
          </div>
        </div>
      )}
    </div>
  );
}

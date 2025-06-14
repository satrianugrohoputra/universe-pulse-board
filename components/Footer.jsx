
export default function Footer({ children }) {
  return (
    <footer className="w-full border-t border-white/10 bg-black/50 py-2 px-2 flex justify-between items-center text-xs text-white/80 fixed bottom-0 left-0 z-40">
      <div>
        <span className="mr-2">Built with <span className="text-red-400">❤️</span> using NASA API &amp; CoinAPI.</span>
      </div>
      <div>
        &copy; {new Date().getFullYear()} Universe Pulse 🌌
      </div>
      {children}
    </footer>
  );
}

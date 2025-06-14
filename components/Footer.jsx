
export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-black/50 py-2 px-2 flex justify-between items-center text-xs text-white/80 fixed bottom-0 left-0 z-40">
      <div>
        <span className="mr-2">🌠 Powered by NASA APIs</span>
        <span className="mr-2">|
          Images: NASA APOD, EPIC, EONET.</span>
        <span className="text-cyan-300">
          Map data: NASA WMTS, CoinGecko
        </span>
      </div>
      <div>
        &copy; {new Date().getFullYear()} AstroExplorer
      </div>
    </footer>
  );
}

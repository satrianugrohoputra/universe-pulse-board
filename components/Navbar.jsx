
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 px-4 md:px-12 bg-black/70 backdrop-blur shadow border-b border-white/10 flex items-center">
      <div className="flex-1 flex items-center gap-4">
        <span className="text-lg md:text-2xl font-extrabold tracking-widest text-accent">AstroExplorer</span>
        <div className="hidden md:flex gap-6 ml-8">
          <Link to="/" className="hover:text-accent font-medium">Today</Link>
          <a href="#journal" className="hover:text-accent font-medium">Journal</a>
          <a href="#events" className="hover:text-accent font-medium">Events</a>
        </div>
      </div>
    </nav>
  );
}

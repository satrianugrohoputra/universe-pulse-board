
import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import APODCard from "./APODCard";
import EPICCard from "./EPICCard";
import PlanetMap from "./PlanetMap";
import CryptoCard from "./CryptoCard";
import MoodJournal from "./MoodJournal";
import EventMap from "./EventMap";
import StarBackground from "./StarBackground";

const Dashboard: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full bg-background text-white overflow-x-hidden selection:bg-cyan-500/40 z-0">
      <StarBackground />
      <Navbar />
      <main className="relative z-10 pt-20 pb-12 md:pb-24 w-full max-w-7xl mx-auto px-2 md:px-6 flex flex-col min-h-screen">
        <section
          className="mb-8 text-center animate-fade-in"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent animate-fade-in">
            Universe Pulse Dashboard
          </h1>
          <div className="text-base md:text-lg text-cyan-300/90 mt-3 font-medium">
            Daily cosmic data, planetary news, &amp; market pulses from across the galaxy 🚀🪐✨
          </div>
        </section>
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fade-in"
        >
          {/* Card section, always renders all; relies on each card's own fallback if data fails */}
          <div className="transition hover:scale-[1.025] hover:shadow-2xl duration-300">
            <APODCard />
          </div>
          <div className="transition hover:scale-[1.025] hover:shadow-2xl duration-300">
            <EPICCard />
          </div>
          <div className="transition hover:scale-[1.025] hover:shadow-2xl duration-300">
            <PlanetMap />
          </div>
          <div className="transition hover:scale-[1.025] hover:shadow-2xl duration-300">
            <CryptoCard />
          </div>
          <div className="transition hover:scale-[1.025] hover:shadow-2xl duration-300 col-span-1 md:col-span-2">
            <MoodJournal />
          </div>
          <div className="transition hover:scale-[1.025] hover:shadow-2xl duration-300 col-span-1 md:col-span-2">
            <EventMap />
          </div>
        </div>
      </main>
      <Footer>
        {/* Overridden in Footer component for custom text */}
      </Footer>
      {/* Margin to prevent footer from overlapping content */}
      <div className="pb-16" />
    </div>
  );
};

export default Dashboard;

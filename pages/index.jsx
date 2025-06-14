
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import APODCard from "@/components/APODCard";
import EPICCard from "@/components/EPICCard";
import PlanetMap from "@/components/PlanetMap";
import CryptoCard from "@/components/CryptoCard";
import MoodJournal from "@/components/MoodJournal";
import EventMap from "@/components/EventMap";

const today = new Date().toLocaleDateString(undefined, { dateStyle: "long" });

export default function Home() {
  return (
    <div>
      <Navbar />
      <div className="pt-20 pb-8 px-2 md:px-10 min-h-[90vh] bg-background">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            AstroExplorer Dashboard
          </h1>
          <div className="text-accent mt-1">
            {today}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
          <APODCard />
          <EPICCard />
          <PlanetMap />
          <CryptoCard />
          <MoodJournal />
          <EventMap />
        </div>
      </div>
      <Footer />
    </div>
  );
}

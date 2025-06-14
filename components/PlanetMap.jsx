
import { useState, useRef, useEffect } from "react";

const planetData = {
  moon: {
    name: "Moon",
    info: "Earth's only natural satellite, formed ~4.5 billion years ago",
    facts: ["Distance: 384,400 km", "Diameter: 3,474 km", "Gravity: 1/6 of Earth"]
  },
  mars: {
    name: "Mars",
    info: "The Red Planet, fourth from the Sun in our solar system",
    facts: ["Distance: 225M km", "Day: 24h 37m", "2 moons: Phobos & Deimos"]
  },
  jupiter: {
    name: "Jupiter",
    info: "Largest planet in our solar system, a gas giant",
    facts: ["79 known moons", "Great Red Spot storm", "Could fit 1,300 Earths"]
  }
};

export default function PlanetMap() {
  const [selectedPlanet, setSelectedPlanet] = useState("moon");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [zoomedImage, setZoomedImage] = useState(null);

  useEffect(() => {
    setImageLoaded(false);
    setCurrentFactIndex(0);
  }, [selectedPlanet]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFactIndex(prev => 
        (prev + 1) % planetData[selectedPlanet].facts.length
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedPlanet]);

  const planetImages = {
    moon: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop",
    mars: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800&h=600&fit=crop", 
    jupiter: "https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?w=800&h=600&fit=crop"
  };

  return (
    <div className="rounded-xl shadow-md p-4 bg-white/10 border border-white/20 flex flex-col min-h-[24rem] h-[24rem]">
      <div className="flex justify-between items-center mb-4">
        <span className="font-bold text-white text-lg">Planetary Explorer</span>
        <select
          className="bg-black/50 border border-cyan-400/50 text-white rounded-lg px-3 py-1 focus:outline-none focus:border-cyan-400"
          value={selectedPlanet}
          onChange={e => setSelectedPlanet(e.target.value)}
        >
          <option value="moon">🌙 Moon</option>
          <option value="mars">🔴 Mars</option>
          <option value="jupiter">🪐 Jupiter</option>
        </select>
      </div>
      
      <div className="relative w-full h-48 rounded-lg overflow-hidden bg-black/30 mb-4 group">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full" />
          </div>
        )}
        <img
          src={planetImages[selectedPlanet]}
          alt={planetData[selectedPlanet].name}
          className={`w-full h-full object-cover transition-all duration-500 cursor-pointer hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onClick={() => setZoomedImage(planetImages[selectedPlanet])}
        />
        
        {/* Zoom Indicator */}
        <div className="absolute top-4 right-4 bg-black/60 px-2 py-1 rounded text-xs text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity">
          🔍 Click to zoom
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white font-bold text-xl mb-1">
            {planetData[selectedPlanet].name}
          </h3>
          <p className="text-cyan-200 text-sm">
            {planetData[selectedPlanet].info}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between min-h-0">
        <div className="bg-black/30 rounded-lg p-3 mb-3">
          <div className="text-cyan-300 text-sm font-medium mb-1">Did you know?</div>
          <div className="text-white text-sm transition-all duration-500">
            {planetData[selectedPlanet].facts[currentFactIndex]}
          </div>
        </div>

        <div className="flex justify-center gap-1 mb-3">
          {planetData[selectedPlanet].facts.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentFactIndex ? 'bg-cyan-400' : 'bg-white/30'
              }`}
            />
          ))}
        </div>

        <div className="text-xs text-cyan-100 opacity-70 text-center">
          Explore celestial bodies • Images via Unsplash
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
              alt={planetData[selectedPlanet].name} 
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
            <div className="absolute bottom-4 left-4 right-4 bg-black/80 p-3 rounded-lg">
              <div className="text-cyan-300 font-bold text-lg">{planetData[selectedPlanet].name}</div>
              <div className="text-white text-sm mt-1">{planetData[selectedPlanet].info}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

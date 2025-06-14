import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const legendClasses = {
  "Wildfires": "bg-red-500",
  "Severe Storms": "bg-yellow-300 text-black",
  "Volcanoes": "bg-orange-600",
  "Earthquakes": "bg-purple-600",
  "Other": "bg-cyan-400",
};

const continents = {
  "Global": { center: [15, 0], zoom: 2 },
  "North America": { center: [45, -100], zoom: 3 },
  "South America": { center: [-15, -60], zoom: 3 },
  "Europe": { center: [54, 15], zoom: 4 },
  "Africa": { center: [0, 20], zoom: 3 },
  "Asia": { center: [30, 100], zoom: 3 },
  "Australia/Oceania": { center: [-25, 140], zoom: 4 }
};

function markerColor(category) {
  if (category === "Wildfires") return "red";
  if (category === "Severe Storms") return "gold";
  if (category === "Volcanoes") return "orange";
  if (category === "Earthquakes") return "purple";
  return "cyan";
}

export default function EventMap() {
  const [events, setEvents] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [selectedContinent, setSelectedContinent] = useState("Global");
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    console.log("Fetching EONET events...");
    fetch("https://eonet.gsfc.nasa.gov/api/v3/events")
      .then(r => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      })
      .then(d => {
        console.log("EONET events loaded:", d.events?.length || 0);
        setEvents(d.events || []);
        setLoaded(true);
      })
      .catch(err => {
        console.error("EONET fetch error:", err);
        setError(true);
        setLoaded(true);
      });
  }, []);

  const handleContinentChange = (continent) => {
    setSelectedContinent(continent);
    setMapKey(prev => prev + 1);
  };

  // Filtering events per continent by coordinate
  const filterEventsByContinent = (events, continent) => {
    if (continent === "Global") return events;

    return events.filter(evt => {
      if (!evt.geometry || !evt.geometry[0] || !evt.geometry[0].coordinates) return false;
      const [lng, lat] = evt.geometry[0].coordinates;
      switch (continent) {
        case "North America":
          return lat >= 15 && lat <= 85 && lng >= -170 && lng <= -50;
        case "South America":
          return lat >= -60 && lat <= 15 && lng >= -85 && lng <= -30;
        case "Europe":
          return lat >= 35 && lat <= 75 && lng >= -15 && lng <= 60;
        case "Africa":
          return lat >= -40 && lat <= 40 && lng >= -20 && lng <= 55;
        case "Asia":
          return lat >= 5 && lat <= 80 && lng >= 25 && lng <= 180;
        case "Australia/Oceania":
          return lat >= -50 && lat <= 10 && lng >= 110 && lng <= 180;
        default:
          return true;
      }
    });
  };

  function iconUrl(color) {
    return `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`;
  }

  const filteredEvents = filterEventsByContinent(events, selectedContinent);

  if (error) {
    return (
      <div className="rounded-3xl shadow-xl p-6 bg-white/10 border border-white/20 max-w-[1100px] mx-auto my-6">
        <h2 className="font-bold mb-2 text-white">Natural Events Map (EONET)</h2>
        <div className="text-red-400">Failed to load natural events data.</div>
      </div>
    );
  }

  return (
    <div
      id="events"
      className="rounded-3xl shadow-xl p-6 bg-white/10 border border-white/20 max-w-[1100px] mx-auto my-6"
      style={{
        minWidth: "320px",
      }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
        <h2 className="font-bold text-white text-lg md:text-xl">
          Natural Events Map (EONET)
        </h2>
        {/* More visible and user-friendly continent select dropdown */}
        <div className="relative w-full max-w-[260px] mt-2 md:mt-0 md:ml-auto">
          <select
            className="bg-slate-900 border-2 border-cyan-400/70 text-white rounded-xl px-4 py-2 pr-8 text-base font-medium shadow-sm focus:outline-none focus:border-cyan-400 transition-all ease-in-out duration-150 cursor-pointer w-full appearance-none"
            value={selectedContinent}
            onChange={e => handleContinentChange(e.target.value)}
            style={{
              boxShadow: '0 2px 16px 0 rgba(6,182,212,0.07)',
              backgroundImage:
                'linear-gradient(45deg,rgba(6,182,212,0.12),rgba(28,28,38,0.85))',
            }}
            aria-label="Select continent"
          >
            {Object.keys(continents).map(continent => (
              <option key={continent} value={continent}>
                {continent === "Global" ? "🌍" : continent === "North America" ? "🇺🇸" :
                 continent === "South America" ? "🇧🇷" : continent === "Europe" ? "🇪🇺" :
                 continent === "Africa" ? "🌍" : continent === "Asia" ? "🇨🇳" : "🇦🇺"} {continent}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-cyan-300">
            ▼
          </span>
        </div>
      </div>
      <div className="relative">
        <div className="w-full h-[360px] md:h-[480px] bg-black/60 rounded-2xl overflow-hidden transition-all duration-300 border border-white/20">
          {loaded ? (
            <MapContainer
              key={mapKey}
              center={continents[selectedContinent].center}
              zoom={continents[selectedContinent].zoom}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "1.25rem",
                fontFamily: "inherit"
              }}
              className="leaflet-container"
              scrollWheelZoom={true}
              dragging={true}
              doubleClickZoom={true}
              closePopupOnClick={false}
              worldCopyJump={true}
              tap={false}
              inertia={true}
              inertiaDeceleration={3500}
              inertiaMaxSpeed={1750}
              zoomSnap={0.25}
              zoomDelta={0.25}
              minZoom={2}
              attributionControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredEvents.map(evt =>
                evt.geometry && evt.geometry[0] && evt.geometry[0].coordinates ? (
                  <Marker
                    key={evt.id}
                    position={[evt.geometry[0].coordinates[1], evt.geometry[0].coordinates[0]]}
                    icon={
                      window.L
                        ? window.L.icon({
                            iconUrl: iconUrl(markerColor(evt.categories[0]?.title)),
                            iconSize: [25, 41], iconAnchor: [12, 41]
                          })
                        : undefined
                    }
                  >
                    <Popup>
                      <div className="font-bold">{evt.title}</div>
                      <div className="text-xs text-cyan-300">{evt.categories?.[0]?.title}</div>
                      <div className="text-xs text-white/80">{new Date(evt.geometry[0].date).toLocaleString()}</div>
                      {evt.description && (
                        <div className="text-xs opacity-70 mt-1">{evt.description}</div>
                      )}
                      {evt.link && (
                        <a href={evt.link} className="text-cyan-400 underline text-xs mt-1 block" target="_blank" rel="noopener noreferrer">More Info</a>
                      )}
                    </Popup>
                  </Marker>
                ) : null
              )}
            </MapContainer>
          ) : (
            <div className="animate-pulse w-full h-full bg-gray-900/30 rounded-lg flex items-center justify-center">
              <div className="text-cyan-300">Loading natural events...</div>
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-4 flex-wrap">
          {Object.entries(legendClasses).map(([title, style]) => (
            <div key={title} className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${style}`}>
              <span className="w-2 h-2 rounded-full inline-block bg-white/80 mr-1" />
              {title}
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-cyan-100 opacity-80">
          Map: OpenStreetMap | Events: NASA EONET ({filteredEvents.length} events in {selectedContinent})
        </div>
      </div>
    </div>
  );
}

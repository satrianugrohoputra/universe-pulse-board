
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, LayersControl, LayerGroup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const legendClasses = {
  "Wildfires": "bg-red-500",
  "Severe Storms": "bg-yellow-300 text-black",
  "Volcanoes": "bg-orange-600",
  "Earthquakes": "bg-purple-600",
  "Other": "bg-cyan-400",
};

function markerColor(category) {
  if (category === "Wildfires") return "red";
  if (category === "Severe Storms") return "gold";
  if (category === "Volcanoes") return "orange";
  if (category === "Earthquakes") return "purple";
  return "cyan";
}

const fetcher = url => fetch(url).then(r => r.json());

export default function EventMap() {
  const [events, setEvents] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/eonet")
      .then(r => r.json())
      .then(d => {
        setEvents(d.events || []);
        setLoaded(true);
      })
  }, []);

  function iconUrl(color) {
    return `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`;
  }

  return (
    <div id="events" className="rounded-xl shadow-md p-4 bg-white/10 border border-white/20">
      <h2 className="font-bold mb-2 text-white">Natural Events Map (EONET)</h2>
      <div className="relative">
        <div className="w-full h-56 bg-black/60 rounded-lg overflow-hidden">
          {loaded ? (
            <MapContainer
              center={[15, 0]}
              zoom={2}
              style={{ width: "100%", height: "14rem", borderRadius: "0.5rem" }}
              className="leaflet-container"
              scrollWheelZoom={false}
              dragging={true}
              zoomControl={true}
              attributionControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {events.map(evt =>
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
                        <a href={evt.link} className="text-accent underline text-xs mt-1 block" target="_blank" rel="noopener noreferrer">More Info</a>
                      )}
                    </Popup>
                  </Marker>
                ) : null
              )}
            </MapContainer>
          ) : (
            <div className="animate-pulse w-full h-full bg-gray-900/30 rounded" />
          )}
        </div>
        <div className="flex gap-2 mt-3 flex-wrap">
          {Object.entries(legendClasses).map(([title, style]) => (
            <div key={title} className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${style}`}>
              <span className="w-2 h-2 rounded-full inline-block bg-white/80 mr-1" />
              {title}
            </div>
          ))}
        </div>
        <div className="mt-1 text-xs text-cyan-100 opacity-80">Map: OpenStreetMap | Events: NASA EONET</div>
      </div>
    </div>
  );
}


import { useState, useRef, useEffect } from "react";

const layers = [
  {
    label: "Moon (LRO LROC WAC)",
    value: "moon",
    url:
      "https://moonmaps.cartocdn.com/wmts/lroc_wac_global/WMTSCapabilities.xml",
    // Tile URL format for a real NASA endpoint
    // For demo you may need proxies or an actual tile server, this is a placeholder
  },
  {
    label: "Mars (Visible MJ)",
    value: "mars",
    url:
      "https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/",
  },
  {
    label: "Asteroid Vesta",
    value: "vesta",
    url:
      "https://trek.nasa.gov/tiles/Vesta/EQ/Vesta_Global_ClrMosaic_450m/",
  },
];

// Workaround: Embed OpenLayers with dynamic loading (WMTS is tricky to demo here!)
export default function PlanetMap() {
  const [layer, setLayer] = useState("moon");
  const ref = useRef();

  useEffect(() => {
    import("ol/Map").then(({ default: Map }) => {
      import("ol/View").then(({ default: View }) => {
        import("ol/layer/Tile").then(({ default: TileLayer }) => {
          import("ol/source/XYZ").then(({ default: XYZ }) => {
            if (!ref.current || ref.current._map) return;
            const base = {
              moon:
                "https://s3.amazonaws.com/moonwmts/lro_lroc_wac_global/%7BZ%7D/%7BX%7D/%7BY%7D.png",
              mars:
                "https://s3.amazonaws.com/marswmts/mdim21/%7BZ%7D/%7BX%7D/%7BY%7D.png",
              vesta:
                "https://stamen-tiles.a.ssl.fastly.net/toner/%7BZ%7D/%7BX%7D/%7BY%7D.png",
            };
            const map = new Map({
              target: ref.current,
              layers: [
                new TileLayer({
                  source: new XYZ({
                    url: base[layer],
                    crossOrigin: "anonymous",
                  }),
                }),
              ],
              view: new View({
                center:
                  layer === "moon"
                    ? [2321420, -395228]
                    : layer === "mars"
                    ? [11538000, -4263500]
                    : [0, 0],
                zoom: 2.2,
                projection: "EPSG:3857",
              }),
              controls: [],
            });
            ref.current._map = map;
          });
        });
      });
    });
    return () => {
      if (ref.current && ref.current._map) {
        ref.current._map.setTarget(null);
        ref.current._map = null;
      }
    };
  }, [layer]);

  return (
    <div className="rounded-xl shadow-md p-4 bg-white/10 border border-white/20 flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-white">Planetary Map</span>
        <select
          className="bg-black/30 border border-cyan-400 text-white rounded px-2 py-1 focus:outline-accent"
          value={layer}
          onChange={e => setLayer(e.target.value)}
        >
          <option value="moon">Moon</option>
          <option value="mars">Mars</option>
          <option value="vesta">Vesta</option>
        </select>
      </div>
      <div ref={ref} className="w-full h-56 rounded-md overflow-hidden bg-black mt-2 border border-white/10" />
      <div className="text-xs mt-2 text-cyan-100 opacity-70">
        Drag or zoom to explore. Tiles: NASA/JPL/USGS
      </div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import CustomHeatmapLayer from './CustomHeatmapLayer';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getRegionFromCoords } from '../utils/regions';

const StopHeatMap = ({ trips, selectedRegion }) => {
  const [minTrains, setMinTrains] = useState(0);
  const [filterActive, setFilterActive] = useState(false);

  const stopData = useMemo(() => {
    const stopCounts = {};
    const stopInfo = {};

    trips.forEach(trip => {
      trip.stops.forEach(stop => {
        if (stop.stop_lat && stop.stop_lon) {
          const key = `${stop.stop_lat},${stop.stop_lon}`;
          stopCounts[key] = (stopCounts[key] || 0) + 1;
          stopInfo[key] = stop.stop_name;
        }
      });
    });

    return Object.entries(stopCounts).map(([key, count]) => {
      const [lat, lon] = key.split(',').map(Number);
      const stop_name = stopInfo[key] || 'Unknown';
      const region = getRegionFromCoords(lat, lon);

      return { lat, lon, count, stop_name, region };
    });
  }, [trips]);

  const filteredStops = useMemo(() => {
    return stopData.filter(s => {
      const passesTrainCount = !filterActive || s.count >= minTrains;
      const passesRegion = selectedRegion === "Toutes" || s.region === selectedRegion;
      return passesTrainCount && passesRegion;
    });
  }, [stopData, minTrains, filterActive, selectedRegion]);

  const maxCount = useMemo(() => Math.max(...stopData.map(s => s.count)), [stopData]);

  return (
    <div className="w-full bg-white rounded shadow mt-6">
      <div className="px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-lg font-bold">📍 Carte de densité des gares desservies</h2>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* Min Train Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Min. trains:</label>
            <input
              type="number"
              className="border rounded px-2 py-1 w-20"
              value={minTrains}
              onChange={(e) => setMinTrains(Number(e.target.value))}
              min="0"
            />
            <button
              onClick={() => setFilterActive(!filterActive)}
              className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors duration-300 ${
                filterActive ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                  filterActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="h-[500px]">
        <MapContainer center={[47, 2]} zoom={6} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <CustomHeatmapLayer
            points={filteredStops.map(s => [s.lat, s.lon, s.count])}
            maxIntensity={maxCount}
          />
          {filteredStops.map((s, i) => (
            <Marker
              key={i}
              position={[s.lat, s.lon]}
              icon={L.divIcon({ className: 'invisible-marker' })}
            >
              <Popup>
                <strong>{s.stop_name}</strong><br />
                {s.count} train{(s.count > 1 ? 's' : '')} desservent cette gare<br />
                Région : {s.region}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default StopHeatMap;

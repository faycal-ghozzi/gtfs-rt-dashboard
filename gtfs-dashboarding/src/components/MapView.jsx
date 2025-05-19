import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import MapAutoFixer from './MapAutoFixer';

const MapView = ({ trip }) => {
  if (!trip) return null;

  const coordinates = trip.stops.map(stop => {
    const lat = parseFloat(stop.stop_lat);
    const lon = parseFloat(stop.stop_lon);
    return (!isNaN(lat) && !isNaN(lon)) ? [lat, lon] : null;
  }).filter(Boolean);

  if (!coordinates.length) return <p className="text-sm text-gray-500">Aucune donnée géographique disponible.</p>;

  return (
    <div className="h-[500px] mt-6">
      <h2 className="text-xl font-semibold mb-2">Carte du trajet</h2>
      <MapContainer center={coordinates[0]} zoom={8} className="h-[500px] w-full" style={{ height: '500px', width: '100%' }}>
        <MapAutoFixer />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Polyline positions={coordinates} />
        {coordinates.map((pos, idx) => (
          <Marker position={pos} key={idx}>
            <Popup>
              {trip.stops[idx]?.stop_name} <br />
              🕒 Arrivée: {trip.stops[idx]?.arrival} <br />
              🕒 Départ: {trip.stops[idx]?.departure} <br />
              ⏱️ <span className={getDelayColor(trip.stops[idx]?.delay)}>
                {trip.stops[idx]?.delay}
              </span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

const getDelayColor = (delayLabel) => {
  if (delayLabel === "on time") return "text-green-600";
  if (delayLabel?.includes("min")) return "text-red-600 font-bold";
  if (delayLabel?.includes("sec")) return "text-yellow-500";
  return "text-gray-700";
};

export default MapView;
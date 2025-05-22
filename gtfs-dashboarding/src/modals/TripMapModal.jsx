import React, { useEffect, useState } from 'react';
import {
    MapContainer,
    TileLayer,
    Marker,
    Polyline,
    Popup,
    useMap,
} from 'react-leaflet';
import { DateTime } from 'luxon';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const trainIcon = new L.Icon({
    iconUrl: '/train-icon.png',
    iconSize: [25, 25],
    iconAnchor: [12, 12],
});

const MapAutoFixer = () => {
    const map = useMap();
    useEffect(() => {
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }, [map]);
    return null;
};

const getDelayColor = (delayLabel) => {
    if (delayLabel === 'on time') return 'text-green-600';
    if (delayLabel?.includes('min')) return 'text-red-600 font-bold';
    if (delayLabel?.includes('sec')) return 'text-yellow-500';
    return 'text-gray-700';
};

const correctCoord = (value) => {
    if (typeof value === 'string') {
        return parseFloat(value.replace(/[^-\d.]/g, '')) || 0;
    }
    return parseFloat(value) || 0;
};

const TripMapModal = ({ trip, onClose }) => {
    const [stops, setStops] = useState([]);

    const now = DateTime.now().setZone('Europe/Paris');

    useEffect(() => {
        if (!trip) return;
        const parsedStops = trip.stops.map((s) => ({
            ...s,
            stop_lat: correctCoord(s.stop_lat),
            stop_lon: correctCoord(s.stop_lon),
            time: DateTime.fromFormat(s.departure || s.arrival || '', 'HH:mm', {
                zone: 'Europe/Paris',
            }),
        }));
        setStops(parsedStops);
    }, [trip]);

    if (!trip || stops.length < 2) return null;

    const currentIndex = stops.findIndex((s) => now < s.time);
    const passed = stops.slice(0, currentIndex);
    const upcoming = stops.slice(currentIndex);

    const passedCoords = passed.map((s) => [s.stop_lat, s.stop_lon]);
    const upcomingCoords = upcoming.map((s) => [s.stop_lat, s.stop_lon]);

    let trainPosition = null;
    const occupiedSegment = [];

    const isLastStop = currentIndex === stops.length - 1;
    const shouldRenderRed = currentIndex > 0 || isLastStop;

    if (shouldRenderRed) {
        const prev = stops[currentIndex - 1] || stops.at(-2);
        const next = stops[currentIndex] || stops.at(-1);

        if (prev && next) {
            occupiedSegment.push([prev.stop_lat, prev.stop_lon], [next.stop_lat, next.stop_lon]);

            const prevTime = prev.time;
            const nextTime = next.time;

            if (prevTime?.isValid && nextTime?.isValid && nextTime > prevTime) {
                const totalDuration = nextTime.diff(prevTime).as('seconds');
                const elapsed = now.diff(prevTime).as('seconds');
                const ratio = Math.min(Math.max(elapsed / totalDuration, 0), 1);

                const lat = prev.stop_lat + (next.stop_lat - prev.stop_lat) * ratio;
                const lon = prev.stop_lon + (next.stop_lon - prev.stop_lon) * ratio;
                trainPosition = [lat, lon];
            }
        }
    }


    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="relative bg-white w-full max-w-6xl h-[600px] rounded shadow-lg overflow-hidden">
                <div className="flex justify-between items-center px-4 py-2 bg-gray-100 border-b">
                    <h2 className="text-lg font-semibold">Carte du Trajet</h2>
                    <button
                        className="text-3xl transform rotate-45 font-bold text-gray-600 hover:text-black"
                        onClick={onClose}
                    >
                        +
                    </button>
                </div>
                <MapContainer
                    center={trainPosition || [stops[0].stop_lat, stops[0].stop_lon]}
                    zoom={8}
                    className="h-[500px] w-full"
                    style={{ height: '500px', width: '100%' }}
                >
                    <MapAutoFixer />
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    {passedCoords.length >= 2 && <Polyline positions={passedCoords} color="gray" />}
                    {upcomingCoords.length >= 2 && <Polyline positions={upcomingCoords} color="blue" />}
                    {occupiedSegment.length === 2 && <Polyline positions={occupiedSegment} color="red" />}

                    {stops.map((s, idx) => (
                        <Marker key={idx} position={[s.stop_lat, s.stop_lon]}>
                            <Popup>
                                {s.stop_name} <br />
                                🕒 Arrivée: {s.arrival} <br />
                                🕒 Départ: {s.departure} <br />
                                ⏱️ <span className={getDelayColor(s.delay)}>{s.delay}</span>
                            </Popup>
                        </Marker>
                    ))}

                    {trainPosition && (
                        <Marker position={trainPosition} icon={trainIcon}>
                            <Popup>🚆 En route</Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>
        </div>
    );
};

export default TripMapModal;

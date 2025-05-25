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

L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/marker-icon-2x.png',
    iconUrl: '/marker-icon.png',
    shadowUrl: '/marker-shadow.png',
});

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

const TripMapModal = ({ trip, onClose, darkMode }) => {
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

    const passedCoords =
        currentIndex === -1
            ? stops.map((s) => [s.stop_lat, s.stop_lon])
            : currentIndex > 0
            ? stops.slice(0, currentIndex).map((s) => [s.stop_lat, s.stop_lon])
            : [];

    let upcomingCoords = [];

    if (currentIndex === -1) {
        const lastTwo = stops.slice(-2);
        if (lastTwo.length === 2) {
            upcomingCoords = lastTwo.map((s) => [s.stop_lat, s.stop_lon]);
        }
    } else {
        const sliced = stops.slice(currentIndex > 0 ? currentIndex - 1 : 0);
        if (sliced.length > 1) {
            upcomingCoords = sliced.map((s) => [s.stop_lat, s.stop_lon]);
        }
    }

    let prev = null;
    let next = null;

    if (currentIndex === -1) {
        prev = stops[stops.length - 2];
        next = stops[stops.length - 1];
    } else if (currentIndex === 0) {
        prev = stops[0];
        next = stops[1];
    } else {
        prev = stops[currentIndex - 1];
        next = stops[currentIndex];
    }

    let trainPosition = null;
    if (prev && next) {
        const prevTime = prev.time;
        const nextTime = next.time;

        if (prevTime?.isValid && nextTime?.isValid) {
            const totalDuration = nextTime.diff(prevTime).as('seconds');
            const elapsed = Math.min(now.diff(prevTime).as('seconds'), totalDuration);
            const ratio = Math.min(Math.max(elapsed / totalDuration, 0), 1);

            const lat = prev.stop_lat + (next.stop_lat - prev.stop_lat) * ratio;
            const lon = prev.stop_lon + (next.stop_lon - prev.stop_lon) * ratio;
            trainPosition = [lat, lon];
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="relative bg-white dark:bg-gray-800 w-full max-w-6xl h-[600px] rounded shadow-lg overflow-hidden text-gray-900 dark:text-gray-100">
                <div className="flex justify-between items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
                    <h2 className="text-lg font-semibold">Carte du Trajet</h2>
                    <button
                        className="text-3xl transform rotate-45 font-bold text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
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
                    <TileLayer
                        url={
                            darkMode
                                ? 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
                                : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                        }
                        attribution="&copy; OpenStreetMap contributors"
                    />

                    {passedCoords.length >= 2 && (
                        <Polyline positions={passedCoords} color="gray" />
                    )}

                    {upcomingCoords.length >= 2 && (
                        <Polyline positions={upcomingCoords} color="blue" />
                    )}

                    {stops.map((s, idx) => (
                        <Marker key={idx} position={[s.stop_lat, s.stop_lon]}>
                            <Popup>
                                {s.stop_name} <br />
                                🕒 Arrivée: {s.arrival} <br />
                                🕒 Départ: {s.departure} <br />
                                ⏱️{' '}
                                <span className={getDelayColor(s.delay)}>
                                    {s.delay === 'on time' ? 'à l\'heure' : s.delay}
                                </span>
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

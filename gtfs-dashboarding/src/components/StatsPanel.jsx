import React, { useState, useMemo, useRef, useEffect } from 'react';
import regions, { getRegionFromCoords } from '../utils/regions';
import DelayGainLossChart from '../charts/DelayGainLossChart';
import DelayPerRegionChart from '../charts/DelayPerRegionChart';
import DelaysByHourChart from '../charts/DelaysByHourChart';
import TopStopDelaysChart from '../charts/TopStopDelayChart';
import StopHeatMap from '../charts/StopHeatMap';

const parseDelayToSeconds = (delayStr) => {
  if (!delayStr || delayStr === 'on time') return 0;
  if (delayStr.includes('h')) return parseInt(delayStr) * 3600;
  if (delayStr.includes('min')) return parseInt(delayStr) * 60;
  if (delayStr.includes('sec')) return parseInt(delayStr);
  return 0;
};

const StatsPanel = ({ trips }) => {
  const [selectedRegion, setSelectedRegion] = useState("Toutes");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredTrips = useMemo(() => {
    if (selectedRegion === "Toutes") return trips;
    return trips
      .map(trip => {
        const filteredStops = trip.stops.filter(stop => {
          if (!stop.stop_lat || !stop.stop_lon) return false;
          return getRegionFromCoords(stop.stop_lat, stop.stop_lon) === selectedRegion;
        });
        return { ...trip, stops: filteredStops };
      })
      .filter(trip => trip.stops.length > 0);
  }, [trips, selectedRegion]);

  const delayDataForChart = useMemo(() => {
    const stopMap = {};
  
    filteredTrips.forEach(trip => {
      trip.stops.forEach(stop => {
        const name = stop.stop_name || 'Inconnu';
        const delay = parseDelayToSeconds(stop.delay) / 60; // convert to minutes
  
        if (!stopMap[name]) {
          stopMap[name] = { stop_name: name, totalDelay: 0, count: 0 };
        }
  
        stopMap[name].totalDelay += delay;
        stopMap[name].count += 1;
      });
    });
  
    // Convert map to array with average delay per stop
    const result = Object.values(stopMap).map(({ stop_name, totalDelay, count }) => ({
      stop_name,
      avg_delay_min: +(totalDelay / count).toFixed(1),
    }));
  
    // Return both top 10 and bottom 10
    const top10MostDelayed = [...result]
      .sort((a, b) => b.avg_delay_min - a.avg_delay_min)
      .slice(0, 10);
  
    const top10LeastDelayed = [...result]
      .sort((a, b) => a.avg_delay_min - b.avg_delay_min)
      .slice(0, 10);
  
    return { top10MostDelayed, top10LeastDelayed };
  }, [filteredTrips]);
  
  

  const totalTrips = filteredTrips.length;
  const allStops = useMemo(() => filteredTrips.flatMap(t => t.stops), [filteredTrips]);
  const totalStops = allStops.length;

  const avgDelaySeconds = useMemo(() => {
    const delays = allStops.map(s => parseDelayToSeconds(s.delay));
    const total = delays.reduce((a, b) => a + b, 0);
    return delays.length ? Math.round(total / delays.length) : 0;
  }, [allStops]);

  return (
    <div className="space-y-6">
      {/* Centered Region Dropdown */}
      <div className="flex flex-col items-center mt-4">
        <label className="text-lg font-semibold text-gray-800 mb-2">Région :</label>
        <div className="relative inline-block text-left" ref={dropdownRef}>
          <div>
            <button
              type="button"
              className="inline-flex w-48 justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-haspopup="true"
            >
              {selectedRegion}
              <svg className="-mr-1 size-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {open && (
            <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
              <div className="py-1">
                <button
                  onClick={() => { setSelectedRegion("Toutes"); setOpen(false); }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Toutes
                </button>
                {regions.map((r) => (
                  <button
                    key={r.name}
                    onClick={() => { setSelectedRegion(r.name); setOpen(false); }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow text-center">
          <h3 className="text-gray-500 text-sm uppercase">Trains surveillés en temps réel</h3>
          <p className="text-2xl font-semibold text-blue-600">{totalTrips}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <h3 className="text-gray-500 text-sm uppercase">Total des arrêts</h3>
          <p className="text-2xl font-semibold text-green-600">{totalStops}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <h3 className="text-gray-500 text-sm uppercase">Retard moyen</h3>
          <p className="text-2xl font-semibold text-red-500">
            {avgDelaySeconds >= 3600
              ? `${Math.floor(avgDelaySeconds / 3600)}h ${Math.round((avgDelaySeconds % 3600) / 60)}min`
              : `${Math.round(avgDelaySeconds / 60)} min`}
          </p>
        </div>
      </div>

      {/* 2x2 Chart Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopStopDelaysChart data={delayDataForChart} />
        <DelayGainLossChart trips={filteredTrips} />
        <DelaysByHourChart trips={filteredTrips} />
        <DelayPerRegionChart trips={filteredTrips} />
      </div>

      {/* Full-Width Heatmap */}
      <StopHeatMap trips={filteredTrips} selectedRegion={selectedRegion} />
    </div>
  );
};

export default StatsPanel;

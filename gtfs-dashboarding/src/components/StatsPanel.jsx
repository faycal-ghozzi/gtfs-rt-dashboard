import React, { useState, useMemo, useRef, useEffect } from 'react';
import { getRegionFromCoords } from '../utils/regions';
import DelayGainLossChart from '../charts/DelayGainLossChart';
import DelayPerRegionChart from '../charts/DelayPerRegionChart';
import DelaysByHourChart from '../charts/DelaysByHourChart';
import TopStopDelaysChart from '../charts/TopStopDelayChart';
import StopHeatMap from '../charts/StopHeatMap';
import RegionDropdown from './RegionDropdown';

const parseDelayToSeconds = (delayStr) => {
  if (!delayStr || delayStr === 'on time') return 0;
  if (delayStr.includes('h')) return parseInt(delayStr) * 3600;
  if (delayStr.includes('min')) return parseInt(delayStr) * 60;
  if (delayStr.includes('sec')) return parseInt(delayStr);
  return 0;
};

const StatsPanel = ({ trips, pastTrips, darkMode }) => {
  const [selectedRegion, setSelectedRegion] = useState("Toutes");
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

  const filteredPastTrips = useMemo(() => {
    if (selectedRegion === "Toutes") return pastTrips;
    return pastTrips
      .map(trip => {
        const filteredStops = trip.stops.filter(stop => {
          if (!stop.stop_lat || !stop.stop_lon) return false;
          return getRegionFromCoords(stop.stop_lat, stop.stop_lon) === selectedRegion;
        });
        return { ...trip, stops: filteredStops };
      })
      .filter(trip => trip.stops.length > 0);
  }, [pastTrips, selectedRegion]);

  const delayDataForChart = useMemo(() => {
    const calculateAverages = (trips) => {
      const stopMap = {};
  
      trips.forEach(trip => {
        trip.stops.forEach(stop => {
          const name = stop.stop_name || 'Inconnu';
          const delay = parseDelayToSeconds(stop.delay) / 60;
  
          if (!stopMap[name]) {
            stopMap[name] = { stop_name: name, totalDelay: 0, count: 0 };
          }
  
          stopMap[name].totalDelay += delay;
          stopMap[name].count += 1;
        });
      });
  
      return Object.values(stopMap).map(({ stop_name, totalDelay, count }) => ({
        stop_name,
        avg_delay_min: +(totalDelay / count).toFixed(1),
      }));
    };
  
    const resultFiltered = calculateAverages(filteredTrips);
    const resultAll = calculateAverages(trips);
  
    const top10MostDelayed = [...resultFiltered]
      .sort((a, b) => b.avg_delay_min - a.avg_delay_min)
      .slice(0, 10);
  
    const top10LeastDelayed = [...resultFiltered]
      .sort((a, b) => a.avg_delay_min - b.avg_delay_min)
      .slice(0, 10);
  
    return {
      top10MostDelayed,
      top10LeastDelayed,
      allDelays: resultAll
    };
  }, [filteredTrips, trips]);
  

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
      <div className="flex flex-col items-center mt-4">
      <RegionDropdown
          label="Région"
          selectedRegion={selectedRegion}
          onChange={setSelectedRegion}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow text-center">
          <h3 className="text-gray-500 dark:text-gray-300 text-sm uppercase">Trains surveillés en temps réel</h3>
          <p className="text-2xl font-semibold text-blue-600">{totalTrips}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow text-center">
          <h3 className="text-gray-500 dark:text-gray-300 text-sm uppercase">Total des arrêts</h3>
          <p className="text-2xl font-semibold text-green-600">{totalStops}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow text-center">
          <h3 className="text-gray-500 dark:text-gray-300 text-sm uppercase">Retard moyen</h3>
          <p className="text-2xl font-semibold text-red-500">
            {avgDelaySeconds >= 3600
              ? `${Math.floor(avgDelaySeconds / 3600)}h ${Math.round((avgDelaySeconds % 3600) / 60)}min`
              : `${Math.round(avgDelaySeconds / 60)} min`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopStopDelaysChart data={delayDataForChart} darkMode={darkMode} />
        <DelayGainLossChart trips={filteredTrips} darkMode={darkMode} />
        <DelaysByHourChart trips={filteredTrips} darkMode={darkMode} />
        <DelayPerRegionChart trips={filteredPastTrips} darkMode={darkMode} />
      </div>

      <StopHeatMap trips={filteredTrips} selectedRegion={selectedRegion} darkMode={darkMode}/>
    </div>
  );
};

export default StatsPanel;

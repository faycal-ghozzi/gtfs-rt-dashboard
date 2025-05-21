import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import StopHeatMap from './StopHeatMap';
import TopStopDelaysChart from '../charts/TopStopDelayChart';

const parseDelayToSeconds = (delayStr) => {
  if (!delayStr || delayStr === 'on time') return 0;
  if (delayStr.includes('h')) return parseInt(delayStr) * 3600;
  if (delayStr.includes('min')) return parseInt(delayStr) * 60;
  if (delayStr.includes('sec')) return parseInt(delayStr);
  return 0;
};

const StatsPanel = ({ trips }) => {
  const totalTrips = trips.length;
  const totalStops = trips.reduce((acc, t) => acc + t.stops.length, 0);

  const allStops = trips.flatMap(t =>
    t.stops.map(s => ({
      stop_name: s.stop_name || 'Unknown',
      delay: parseDelayToSeconds(s.delay),
      trip_id: t.trip_id
    }))
  );

  const avgDelay = allStops.length
    ? allStops.reduce((a, b) => a + b.delay, 0) / allStops.length
    : 0;

  // Group average delay per stop
  const stopDelayMap = {};
  allStops.forEach(({ stop_name, delay }) => {
    if (!stopDelayMap[stop_name]) stopDelayMap[stop_name] = [];
    stopDelayMap[stop_name].push(delay);
  });

  const delayPerStop = Object.entries(stopDelayMap).map(([stop_name, delays]) => ({
    stop_name,
    avg_delay_min: Math.round(delays.reduce((a, b) => a + b, 0) / delays.length / 60),
  }));

  // Sort by avg_delay_min descending and take top 10
  const sortedDelayPerStop = delayPerStop
    .sort((a, b) => b.avg_delay_min - a.avg_delay_min)
    .slice(0, 10);

  // Average delay per trip
  const delayPerTrip = trips.map(t => {
    const delays = t.stops.map(s => parseDelayToSeconds(s.delay));
    const avg = delays.length ? delays.reduce((a, b) => a + b, 0) / delays.length : 0;
    return {
      name: t.trip_id.slice(0, 10),
      avg_delay_min: Math.round(avg / 60)
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Stat Cards */}
      <div className="col-span-1 lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow text-center">
          <h3 className="text-gray-500 text-sm uppercase">Total Trips</h3>
          <p className="text-2xl font-semibold text-blue-600">{totalTrips}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <h3 className="text-gray-500 text-sm uppercase">Total Stops</h3>
          <p className="text-2xl font-semibold text-green-600">{totalStops}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <h3 className="text-gray-500 text-sm uppercase">Avg. Delay</h3>
          <p className="text-2xl font-semibold text-red-500">{Math.round(avgDelay / 60)} min</p>
        </div>
      </div>

      {/* Top Delay per Stop */}
        <TopStopDelaysChart data={sortedDelayPerStop} />


      {/* Delay per Trip */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-bold mb-2">📈 Delay per Trip</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={delayPerTrip}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="avg_delay_min" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Heatmap */}
      <div className="col-span-1 lg:col-span-2">
        <StopHeatMap trips={trips} />
      </div>
    </div>
  );
};

export default StatsPanel;

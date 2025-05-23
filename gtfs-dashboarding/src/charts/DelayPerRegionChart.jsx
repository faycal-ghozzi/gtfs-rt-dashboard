import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import regions, { getRegionFromCoords } from '../utils/regions';

const parseDelayToSeconds = (delayStr) => {
  if (!delayStr || delayStr === 'on time') return 0;
  if (delayStr.includes('h')) return parseInt(delayStr) * 3600;
  if (delayStr.includes('min')) return parseInt(delayStr) * 60;
  if (delayStr.includes('sec')) return parseInt(delayStr);
  return 0;
};

const formatDate = (yyyymmdd) => {
  if (!yyyymmdd || yyyymmdd.length !== 8) return yyyymmdd;
  return `${yyyymmdd.slice(6)}/${yyyymmdd.slice(4, 6)}/${yyyymmdd.slice(0, 4)}`;
};

const DelayPerRegionChart = ({ trips, darkMode }) => {
  const regionSeries = useMemo(() => {
    const byDate = {};

    trips.forEach(trip => {
      const date = trip.start_date;
      trip.stops.forEach(stop => {
        if (!stop.stop_lat || !stop.stop_lon) return;
        const region = getRegionFromCoords(stop.stop_lat, stop.stop_lon);
        const delay = parseDelayToSeconds(stop.delay);

        if (!byDate[date]) byDate[date] = {};
        if (!byDate[date][region]) byDate[date][region] = [];
        byDate[date][region].push(delay);
      });
    });

    return Object.entries(byDate).map(([date, regionDelays]) => {
      const entry = { date };
      for (const region in regionDelays) {
        const delays = regionDelays[region];
        const avg = delays.length ? delays.reduce((a, b) => a + b, 0) / delays.length : 0;
        entry[region] = +(avg / 60).toFixed(1);
      }
      return entry;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [trips]);

  const regionKeys = Object.keys(regionSeries[0] || {}).filter(k => k !== "date");

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow my-6">
      <h2 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">
        📈 Évolution du retard par région
      </h2>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={regionSeries}>
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#6b7280' : '#d1d5db'} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fill: darkMode ? '#ffffff' : '#1f2937' }}
            label={{
              value: "Date",
              position: "insideBottom",
              offset: -5,
              fill: darkMode ? '#ffffff' : '#1f2937'
            }}
          />
          <YAxis
            label={{
              value: "Retard moyen (min)",
              angle: -90,
              position: "insideLeft",
              fill: darkMode ? '#ffffff' : '#1f2937'
            }}
            tick={{ fill: darkMode ? '#ffffff' : '#1f2937' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: darkMode ? '#1f2937' : 'white',
              color: darkMode ? '#ffffff' : '#000000',
              border: '1px solid #4b5563'
            }}
            labelStyle={{ color: darkMode ? '#ffffff' : '#000000' }}
            labelFormatter={(label) => `Date : ${formatDate(label)}`}
            formatter={(v) => [`${v} min`, "Retard moyen"]}
          />
          <Legend
            wrapperStyle={{
              color: darkMode ? '#ffffff' : '#1f2937',
              fontSize: '0.85rem'
            }}
          />
          {regionKeys.map((region, i) => (
            <Line
              key={region}
              type="monotone"
              dataKey={region}
              stroke={`hsl(${i * 36}, 70%, 50%)`}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DelayPerRegionChart;

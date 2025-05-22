import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label
} from 'recharts';

const formatDelay = (mins) => {
  const totalSeconds = mins * 60;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}min`);
  if (hours === 0 && minutes === 0) parts.push(`${seconds}sec`);
  return parts.join(' ');
};

const TopStopDelaysChart = ({ data }) => {
  const [sortMode, setSortMode] = useState('desc'); // 'desc' = top delays, 'asc' = least delays

  const chartData = useMemo(() => {
    if (sortMode === 'desc') return data.top10MostDelayed;
    return data.top10LeastDelayed;
  }, [data, sortMode]);

  const maxDelay = Math.max(...chartData.map(d => d.avg_delay_min));
  const yTickFormatter = (value) => {
    if (maxDelay >= 60) {
      const hours = Math.floor(value / 60);
      const minutes = value % 60;
      return hours > 0 ? `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}` : `${minutes}m`;
    }
    return `${value}m`;
  };

  return (
    <div className="bg-white p-4 rounded shadow my-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold">🚉 Classement des Gares par Retards</h2>
        <button
          className="px-3 py-1 rounded bg-gray-200 text-sm font-medium text-gray-800 hover:bg-gray-300"
          onClick={() =>
            setSortMode((prev) => (prev === 'asc' ? 'desc' : 'asc'))
          }
        >
          Trier : {sortMode === 'asc' ? 'Croissant ↑' : 'Décroissant ↓'}
        </button>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 20, bottom: 80, left: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="stop_name"
            interval={0}
            angle={-45}
            textAnchor="end"
            tick={{ fontSize: 12 }}
          >
            <Label value="Stations" position="bottom" offset={55} />
          </XAxis>
          <YAxis tickFormatter={yTickFormatter}>
            <Label
              value="Retard"
              angle={-90}
              position="insideLeft"
              offset={-10}
              style={{ textAnchor: 'middle' }}
            />
          </YAxis>
          <Tooltip
            formatter={(value) => [formatDelay(value), 'Retard']}
            labelFormatter={(label) => `Station : ${label}`}
          />
          <Bar dataKey="avg_delay_min" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopStopDelaysChart;

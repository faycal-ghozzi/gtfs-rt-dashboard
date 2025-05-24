import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label
} from 'recharts';
import * as XLSX from 'xlsx';

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

const TopStopDelaysChart = ({ data, darkMode }) => {
  const [sortMode, setSortMode] = useState('desc');

  const chartData = useMemo(() => {
    return sortMode === 'desc' ? data.top10MostDelayed : data.top10LeastDelayed;
  }, [data, sortMode]);

  const hasData = chartData.length > 0;
  const maxDelay = hasData ? Math.max(...chartData.map(d => d.avg_delay_min)) : 0;

  const yTickFormatter = (value) => {
    if (maxDelay >= 60) {
      const hours = Math.floor(value / 60);
      const minutes = value % 60;
      return hours > 0 ? `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}` : `${minutes}m`;
    }
    return `${value}m`;
  };

  const handleDownloadExcel = () => {
    if (!Array.isArray(data.allDelays) || data.allDelays.length === 0) {
      alert('Aucune donnée disponible à exporter.');
      return;
    }

    const sortedData = [...data.allDelays].sort((a, b) => b.avg_delay_min - a.avg_delay_min);

    const worksheet = XLSX.utils.json_to_sheet(sortedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Retards');

    XLSX.writeFile(workbook, 'retards_stations.xlsx');
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow my-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">🚉 Classement des Gares par Retards (Top 10)</h2>
        <div className="flex space-x-2">
          <button
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={() => setSortMode((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
          >
            Trier : {sortMode === 'asc' ? 'Croissant ↑' : 'Décroissant ↓'}
          </button>
          <button
            className="p-2 rounded bg-green-500 text-white hover:bg-green-600"
            onClick={handleDownloadExcel}
            aria-label="Exporter les données Excel"
            title="Télécharger les données en format Excel"
            >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
            </svg>
            </button>
        </div>
      </div>

      {hasData ? (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 20, bottom: 80, left: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#6b7280' : '#d1d5db'} />
            <XAxis
              dataKey="stop_name"
              interval={0}
              angle={-45}
              textAnchor="end"
              tick={{
                fontSize: 12,
                fill: darkMode ? '#ffffff' : '#1f2937'
              }}
            >
              <Label
                value="Stations"
                position="bottom"
                offset={55}
                fill={darkMode ? '#ffffff' : '#1f2937'}
              />
            </XAxis>
            <YAxis tickFormatter={yTickFormatter} tick={{ fill: darkMode ? '#ffffff' : '#1f2937' }}>
              <Label
                value="Retard"
                angle={-90}
                position="insideLeft"
                offset={-10}
                fill={darkMode ? '#ffffff' : '#1f2937'}
                style={{ textAnchor: 'middle' }}
              />
            </YAxis>
            <Tooltip
              contentStyle={{
                backgroundColor: darkMode ? '#1f2937' : 'white',
                color: darkMode ? '#ffffff' : '#000000',
                border: '1px solid #4b5563'
              }}
              labelStyle={{ color: darkMode ? '#ffffff' : '#000000' }}
              formatter={(value) => [formatDelay(value), 'Retard moyen']}
              labelFormatter={(label) => `Station : ${label}`}
            />
            <Bar dataKey="avg_delay_min" fill={darkMode ? '#60a5fa' : '#8884d8'} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-300 py-16">
          Aucune gare n’a accumulé de retard significatif pour l’instant.
        </div>
      )}
    </div>
  );
};

export default TopStopDelaysChart;

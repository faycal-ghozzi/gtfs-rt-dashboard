import React from 'react';
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
  const maxDelay = Math.max(...data.map(d => d.avg_delay_min));

  let yLabelUnit = 'Retard';
  const yTickFormatter = (value) => {
    if (maxDelay >= 60) {
      const hours = Math.floor(value / 60);
      const minutes = value % 60;
      return hours > 0 ? `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}` : `${minutes}m`;
    } else {
      return `${value}m`;
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-bold mb-2">🚉 Top Stop Delays</h2>
      <ResponsiveContainer width="100%" height={420}>
        <BarChart
          data={data}
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
              value={yLabelUnit}
              angle={-90}
              position="insideLeft"
              offset={-10}
              style={{ textAnchor: 'middle' }}
            />
          </YAxis>
          <Tooltip
            formatter={(value) => [formatDelay(value), 'Retard']}
            labelFormatter={(label) => `Station: ${label}`}
          />
          <Bar dataKey="avg_delay_min" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopStopDelaysChart;

import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label
} from 'recharts';

const parseDelayToSeconds = (delayStr) => {
  if (!delayStr || delayStr === 'on time') return 0;
  if (delayStr.includes('h')) return parseInt(delayStr) * 3600;
  if (delayStr.includes('min')) return parseInt(delayStr) * 60;
  if (delayStr.includes('sec')) return parseInt(delayStr);
  return 0;
};

const formatSeconds = (sec) => {
  if (!sec || sec <= 0) return "on time";
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  let parts = [];
  if (hours > 0) parts.push(`${hours} h`);
  if (minutes > 0) parts.push(`${minutes} min`);
  if (seconds > 0 && hours === 0) parts.push(`${seconds} sec`);
  return parts.join(' ');
};

const DelayEvolutionChart = ({ trip }) => {
  const chartData = useMemo(() => {
    return trip?.stops?.map((stop, index) => {
      const Retard = parseDelayToSeconds(stop.delay);
      return {
        stop_name: stop.stop_name || `Stop ${index + 1}`,
        Retard,
        readableDelay: formatSeconds(Retard),
      };
    }) || [];
  }, [trip]);

  const maxDelay = Math.max(...chartData.map(d => d.Retard), 0);
  const unitLabel = maxDelay >= 3600 ? 'h' : maxDelay >= 60 ? 'min' : 'sec';

  return (
    <div className="bg-white rounded shadow p-4 my-6">
      <h2 className="text-lg font-semibold mb-2">
        ⏱️ Évolution du retard - {trip?.trip_id?.split(":")[0] || "N/A"}
      </h2>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="stop_name" angle={-45} textAnchor="end" height={70}>
            <Label value="Arrêts" offset={-5} position="insideBottom" />
          </XAxis>
          <YAxis
            label={{ value: `Retard (${unitLabel})`, angle: -90, position: 'insideLeft' }}
            tickFormatter={(sec) => {
              if (unitLabel === 'h') return (sec / 3600).toFixed(1);
              if (unitLabel === 'min') return (sec / 60).toFixed(1);
              return sec;
            }}
          />
          <Tooltip
            formatter={(value) => formatSeconds(value)}
            labelFormatter={(label) => `Arrêt : ${label}`}
          />
          <Line
            type="monotone"
            dataKey="Retard"
            stroke="#8884d8"
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DelayEvolutionChart;

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
  Legend,
} from 'recharts';

const parseDelayToSeconds = (delayStr) => {
  if (!delayStr || delayStr === 'on time') return 0;
  if (delayStr.includes('h')) return parseInt(delayStr) * 3600;
  if (delayStr.includes('min')) return parseInt(delayStr) * 60;
  if (delayStr.includes('sec')) return parseInt(delayStr);
  return 0;
};

const formatSeconds = (sec) => {
  if (!sec || sec <= 0) return "à l'heure";
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  let parts = [];
  if (hours > 0) parts.push(`${hours} h`);
  if (minutes > 0) parts.push(`${minutes} min`);
  if (seconds > 0 && hours === 0) parts.push(`${seconds} sec`);
  return parts.join(' ');
};

const DelayEvolutionChart = ({ trip, darkMode }) => {
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

  console.log(darkMode)
  const hasData = chartData.length > 0;
  const maxDelay = Math.max(...chartData.map(d => d.Retard), 0);
  const unitLabel = maxDelay >= 3600 ? 'h' : maxDelay >= 60 ? 'min' : 'sec';

  return (
    <div className="bg-white dark:bg-gray-800 rounded shadow p-4 my-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
        ⏱️ Évolution du retard - {trip?.trip_id?.split(":")[0] || "N/A"}
      </h2>

      {!hasData ? (
        <div className="text-gray-500 dark:text-gray-300 text-center py-16">
          Aucun arrêt n'a été trouvé pour ce trajet, ou les données de retard sont manquantes.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid stroke={darkMode ? '#6b7280' : '#e5e7eb'} strokeDasharray="3 3" />
            <XAxis
              dataKey="stop_name"
              angle={-45}
              textAnchor="end"
              height={70}
              tick={{ fill: darkMode ? '#ffffff' : '#1f2937' }}
            >
              <Label
                value=""
                offset={-5}
                position="insideBottom"
                fill={darkMode ? '#ffffff' : '#1f2937'}
              />
            </XAxis>
            <YAxis
              tick={{ fill: darkMode ? '#ffffff' : '#1f2937' }}
              label={{
                value: `Retard (${unitLabel})`,
                angle: -90,
                position: 'insideLeft',
                fill: darkMode ? '#ffffff' : '#1f2937',
              }}
              tickFormatter={(sec) => {
                if (unitLabel === 'h') return (sec / 3600).toFixed(1);
                if (unitLabel === 'min') return (sec / 60).toFixed(1);
                return sec;
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: darkMode ? '#1f2937' : 'white',
                color: darkMode ? '#ffffff' : '#000000',
                border: '1px solid #4b5563',
              }}
              labelStyle={{ color: darkMode ? '#ffffff' : '#000000' }}
              formatter={(value) => formatSeconds(value)}
              labelFormatter={(label) => `Arrêt : ${label}`}
            />
            <Legend
              wrapperStyle={{
                color: darkMode ? '#ffffff' : '#1f2937',
                fontWeight: '500',
              }}
            />
            <Line
              type="monotone"
              dataKey="Retard"
              stroke={darkMode ? '#60a5fa' : '#6366f1'}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              name="Retard"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default DelayEvolutionChart;

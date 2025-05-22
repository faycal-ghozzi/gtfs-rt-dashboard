import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, Cell
} from 'recharts';

const parseDelayToSeconds = (delayStr) => {
  if (!delayStr || delayStr === 'on time') return 0;
  if (delayStr.includes('h')) return parseInt(delayStr) * 3600;
  if (delayStr.includes('min')) return parseInt(delayStr) * 60;
  if (delayStr.includes('sec')) return parseInt(delayStr);
  return 0;
};

const DelayGainLossChart = ({ trips }) => {
  const [filterMode, setFilterMode] = useState('all');

  const chartData = useMemo(() => {
    const rawData = trips.map(trip => {
      const delays = trip.stops.map(s => parseDelayToSeconds(s.delay));
      const delta = delays.reduce((acc, d, i) => {
        if (i === 0) return acc;
        return acc + (d - delays[i - 1]);
      }, 0); // in seconds

      const netDelayMin = Math.round(delta / 60);
      const from = trip.stops[0]?.stop_name || "???";
      const to = trip.stops.at(-1)?.stop_name || "???";
      const departure = trip.stops[0]?.departure || "??:??";

      return {
        name: `${from} ➝ ${to} @ ${departure}`,
        id: trip.trip_id,
        net_delay_change: netDelayMin,
        abs_change: Math.abs(netDelayMin),
        tooltip: `De ${from} à ${to}<br/>Départ: ${departure}<br/>ID: ${trip.trip_id.split(':')[0]}`
      };
    });

    let filtered = rawData;
    if (filterMode === 'gain') {
      filtered = rawData.filter(d => d.net_delay_change < 0);
    } else if (filterMode === 'loss') {
      filtered = rawData.filter(d => d.net_delay_change > 0);
    }

    return filtered
      .sort((a, b) => b.abs_change - a.abs_change)
      .slice(0, 10);
  }, [trips, filterMode]);

  return (
    <div className="bg-white p-4 rounded shadow my-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold">🔀 Gain / Perte du temps par trajet</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-600">Afficher :</span>
          <button
            className={`px-3 py-1 rounded text-sm font-medium ${filterMode === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setFilterMode('all')}
          >
            Global
          </button>
          <button
            className={`px-3 py-1 rounded text-sm font-medium ${filterMode === 'gain' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setFilterMode('gain')}
          >
            Gains
          </button>
          <button
            className={`px-3 py-1 rounded text-sm font-medium ${filterMode === 'loss' ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setFilterMode('loss')}
          >
            Pertes
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={chartData}
          margin={{ bottom: 60, left: 20, right: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, angle: -45, textAnchor: 'end' }}
            interval={0}
          >
            <Label value="Trajets" offset={55} position="Bottom" />
          </XAxis>
          <YAxis domain={['dataMin - 5', 'dataMax + 5']}>
            <Label value="Δ Temps (min)" angle={-90} position="insideLeft" />
          </YAxis>
          <Tooltip
            formatter={(v) => [`${v} min`, "Δ Temps"]}
            labelFormatter={(_, payload) => {
              const trip = payload?.[0]?.payload;
              return (
                <span
                  dangerouslySetInnerHTML={{
                    __html: trip?.tooltip || '',
                  }}
                />
              );
            }}
          />
          <Bar dataKey="net_delay_change" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.net_delay_change < 0 ? '#86efac' : '#fca5a5'} // green or red pastel
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DelayGainLossChart;

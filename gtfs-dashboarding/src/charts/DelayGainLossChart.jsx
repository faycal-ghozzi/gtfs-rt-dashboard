import React, { useMemo, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, Cell, Legend
} from 'recharts';

const parseDelayToSeconds = (delayStr) => {
    if (!delayStr || delayStr === 'on time') return 0;
    if (delayStr.includes('h')) return parseInt(delayStr) * 3600;
    if (delayStr.includes('min')) return parseInt(delayStr) * 60;
    if (delayStr.includes('sec')) return parseInt(delayStr);
    return 0;
};

const DelayGainLossChart = ({ trips, darkMode }) => {
    const [filterMode, setFilterMode] = useState('all');

    const chartData = useMemo(() => {
        const rawData = trips.map(trip => {
            const delays = trip.stops.map(s => parseDelayToSeconds(s.delay));
            const delta = delays.reduce((acc, d, i) => {
                if (i === 0) return acc;
                return acc + (d - delays[i - 1]);
            }, 0);

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
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow my-6">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                    🔀 Gain / Perte du temps par trajet
                </h2>
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Afficher :</span>
                    <button
                        className={`px-3 py-1 rounded text-sm font-medium ${filterMode === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                        onClick={() => setFilterMode('all')}
                    >
                        Global
                    </button>
                    <button
                        className={`px-3 py-1 rounded text-sm font-medium ${filterMode === 'gain' ? 'bg-green-100 text-green-800' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                        onClick={() => setFilterMode('gain')}
                    >
                        Gains
                    </button>
                    <button
                        className={`px-3 py-1 rounded text-sm font-medium ${filterMode === 'loss' ? 'bg-red-100 text-red-800' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                        onClick={() => setFilterMode('loss')}
                    >
                        Pertes
                    </button>
                </div>
            </div>

            {chartData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-300 text-center text-sm italic">
                    {filterMode === 'gain'
                        ? "Aucun train n'a réussi à récupérer du temps sur le trajet sélectionné."
                        : filterMode === 'loss'
                            ? "Aucun train n'a subi de perte de temps sur le trajet sélectionné."
                            : "Aucun retard enregistré pour les trajets analysés actuellement."}
                </div>
            ) : (
                <div>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData} margin={{ bottom: 60, left: 20, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#6b7280' : '#d1d5db'} />
                        <XAxis
                            dataKey=""
                            tick={({ x, y }) => (
                                <text
                                    x={x}
                                    y={y + 10}
                                    textAnchor="middle"
                                    fill={darkMode ? '#ffffff' : '#1f2937'}
                                    fontSize={8}
                                >
                                    
                                </text>
                            )}
                            interval={0}
                            height={30}
                        />
                        <YAxis
                            domain={['dataMin - 5', 'dataMax + 5']}
                            tick={{ fill: darkMode ? '#ffffff' : '#1f2937' }}
                        >
                            <Label value="Δ Temps (min)" angle={-90} position="insideLeft" fill={darkMode ? '#ffffff' : '#1f2937'} />
                        </YAxis>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: darkMode ? '#1f2937' : 'white',
                                color: darkMode ? '#ffffff' : '#000000',
                                border: '1px solid #4b5563'
                            }}
                            labelStyle={{ color: darkMode ? '#ffffff' : '#000000' }}
                            formatter={(v, name, props) => {
                                const isGain = v < 0;
                                const label = isGain ? 'Gain de temps' : 'Perte de temps';
                                const value = `${Math.abs(v)} min`;
                              
                                return [
                                  darkMode
                                    ? <span style={{ color: '#ffffff' }}>{label}: {value}</span>
                                    : value,
                                ];
                              }}
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
                        <Bar dataKey="net_delay_change" name="Δ Temps" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.net_delay_change < 0 ? '#86efac' : '#fca5a5'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                    
                </ResponsiveContainer>
                <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
  🛈 Survolez un point pour voir les détails du trajet
</p>
                </div>
            )}
            
        </div>
    );
};

export default DelayGainLossChart;

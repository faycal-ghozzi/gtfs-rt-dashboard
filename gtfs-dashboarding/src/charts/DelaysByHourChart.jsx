import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label
} from 'recharts';
import { DateTime } from 'luxon';

const parseDelayToSeconds = (delayStr) => {
  if (!delayStr || delayStr === 'on time') return 0;
  if (delayStr.includes('h')) return parseInt(delayStr) * 3600;
  if (delayStr.includes('min')) return parseInt(delayStr) * 60;
  if (delayStr.includes('sec')) return parseInt(delayStr);
  return 0;
};

const DelaysByHourChart = ({ trips, darkMode }) => {
  const hourlyDelays = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      delays: [],
    }));

    trips.forEach(trip => {
      trip.stops.forEach(stop => {
        const timeStr = stop.arrival || stop.departure;
        if (!timeStr) return;

        const time = DateTime.fromFormat(timeStr, 'HH:mm', { zone: 'Europe/Paris' });
        if (!time.isValid) return;

        const delay = parseDelayToSeconds(stop.delay);
        const hourEntry = hours.find(h => h.hour === time.hour);
        if (hourEntry) {
          hourEntry.delays.push(delay);
        }
      });
    });

    return hours.map(h => ({
      hour: `${String(h.hour).padStart(2, '0')}:00`,
      avg_delay_min: h.delays.length
        ? Math.round(h.delays.reduce((a, b) => a + b, 0) / h.delays.length / 60)
        : 0,
    }));
  }, [trips]);

  const hasDelays = hourlyDelays.some(h => h.avg_delay_min > 0);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow my-6">
      <h2 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">
        ⏰ Retards moyens par heure de la journée
      </h2>

      {!hasDelays ? (
        <div className="text-gray-500 dark:text-gray-300 text-center py-16">
          Aucun retard enregistré sur les différentes heures de la journée.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={hourlyDelays}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#6b7280' : '#d1d5db'} />
            <XAxis
              dataKey="hour"
              tick={{ fill: darkMode ? '#ffffff' : '#1f2937' }}
            >
              <Label
                value="Heure"
                offset={-5}
                position="insideBottom"
                fill={darkMode ? '#ffffff' : '#1f2937'}
              />
            </XAxis>
            <YAxis
              label={{
                value: 'Retard moyen (min)',
                angle: -90,
                position: 'insideLeft',
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
              formatter={(v) => [`${v} min`, 'Retard moyen']}
            />
            <Bar dataKey="avg_delay_min" fill={darkMode ? '#60a5fa' : '#82ca9d'} radius={[4, 4, 0, 0]}/>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default DelaysByHourChart;

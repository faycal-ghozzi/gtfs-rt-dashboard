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

const DelaysByHourChart = ({ trips }) => {
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

  return (
    <div className="bg-white p-4 rounded shadow my-6">
      <h2 className="text-lg font-bold mb-2">⏰ Retards moyens par heure de la journée</h2>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={hourlyDelays}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour">
            <Label value="Heure" offset={-5} position="insideBottom" />
          </XAxis>
          <YAxis label={{ value: 'Retard moyen (min)', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(v) => [`${v} min`, 'Retard moyen']} />
          <Bar dataKey="avg_delay_min" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DelaysByHourChart;

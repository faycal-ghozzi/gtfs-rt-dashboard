import React from 'react';

const StatsPanel = ({ trips }) => {
  const totalTrips = trips.length;
  const totalStops = trips.reduce((acc, t) => acc + t.stops.length, 0);
  const delayValues = trips.flatMap(t => t.stops.map(s => s.delay)).filter(Boolean);
  const totalDelayInSeconds = delayValues
    .filter(d => typeof d === 'string' && d.includes('min'))
    .map(d => parseInt(d) * 60)
    .reduce((a, b) => a + b, 0) +
    delayValues
      .filter(d => typeof d === 'string' && d.includes('sec'))
      .map(d => parseInt(d))
      .reduce((a, b) => a + b, 0);

  const avgDelay = delayValues.length ? (totalDelayInSeconds / delayValues.length) : 0;

  return (
    <div className="mb-4 p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-2">📊 Trip Statistics</h2>
      <ul className="list-disc pl-6">
        <li>Total Trips: {totalTrips}</li>
        <li>Total Stops: {totalStops}</li>
        <li>Average Delay: {Math.round(avgDelay)} seconds</li>
      </ul>
    </div>
  );
};

export default StatsPanel;
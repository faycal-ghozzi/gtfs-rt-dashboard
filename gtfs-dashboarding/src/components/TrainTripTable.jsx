import React from 'react';

const getDelayColor = (delayLabel) => {
  if (delayLabel === "on time") return "text-green-600";
  if (delayLabel.includes("min")) return "text-red-600 font-bold";
  if (delayLabel.includes("sec")) return "text-yellow-500";
  return "text-gray-700";
};

const TrainTripTable = ({ trips }) => {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-2">Trip Updates</h2>
      <table className="table-auto w-full border">
        <thead>
          <tr>
            <th className="border px-2 py-1">Trip ID</th>
            <th className="border px-2 py-1">First Stop</th>
            <th className="border px-2 py-1">Last Stop</th>
            <th className="border px-2 py-1">Stops</th>
          </tr>
        </thead>
        <tbody>
          {trips.map((trip) => (
            <tr key={trip.trip_id}>
              <td className="border px-2 py-1">{trip.trip_id}</td>
              <td className="border px-2 py-1">{trip.stops[0]?.stop_name}</td>
              <td className="border px-2 py-1">{trip.stops.at(-1)?.stop_name}</td>
              <td className="border px-2 py-1">{trip.stops.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TrainTripTable;
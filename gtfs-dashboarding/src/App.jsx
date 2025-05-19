import React, { useEffect, useState } from 'react';
import { getTrips } from './api';
import TrainTripTable from './components/TrainTripTable';
import MapView from './components/MapView';
import StatsPanel from './components/StatsPanel';

const App = () => {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);

  useEffect(() => {
    const fetchTrips = async () => {
      const data = await getTrips();
      setTrips(data);
    };
    fetchTrips();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Tableau de bord des trains SNCF</h1>
      <StatsPanel trips={trips} />

      <select
        className="mb-4 border p-2 rounded"
        onChange={(e) => setSelectedTrip(trips.find(t => t.trip_id === e.target.value))}
      >
        <option value="">-- Sélectionnez un trajet --</option>
        {trips.map((trip) => (
          <option key={trip.trip_id} value={trip.trip_id}>
            {trip.trip_id} ({trip.stops[0]?.stop_name} ➝ {trip.stops.at(-1)?.stop_name})
          </option>
        ))}
      </select>

      <MapView trip={selectedTrip} />
      <TrainTripTable trips={trips} />
    </div>
  );
};

export default App;

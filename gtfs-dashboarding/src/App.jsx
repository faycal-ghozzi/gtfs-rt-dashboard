import React, { useEffect, useState } from 'react';
import { getTrips } from './utils/api';
import TrainTripTable from './components/TrainTripTable';
import MapView from './components/MapView';
import StatsPanel from './components/StatsPanel';
import HistoryTripTable from './components/HistoryTripTable';
import { filterTrips } from './utils/filterTrips';

const App = () => {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [currentTrips, setCurrentTrips] = useState([]);
  const [pastTrips, setPastTrips] = useState([]);

  useEffect(() => {
    const fetchTrips = async () => {
      const data = await getTrips();
      const { currentTrips, pastTrips } = filterTrips(data);
      setCurrentTrips(currentTrips);
      setPastTrips(pastTrips);
    };
    fetchTrips();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Tableau de bord des trains SNCF</h1>

      <StatsPanel trips={currentTrips} />

      <select
        className="mb-4 border p-2 rounded"
        onChange={(e) =>
          setSelectedTrip(currentTrips.find(t => t.trip_id === e.target.value))
        }
      >
        <option value="">-- Sélectionnez un trajet --</option>
        {currentTrips.map((trip) => (
          <option key={trip.trip_id} value={trip.trip_id}>
            {trip.trip_id} ({trip.stops[0]?.stop_name} ➝ {trip.stops.at(-1)?.stop_name})
          </option>
        ))}
      </select>

      <MapView trip={selectedTrip} />

      <h2 className="text-2xl font-semibold mt-6 mb-2">🚆 Ongoing Trips</h2>
      <TrainTripTable trips={currentTrips} />

      <h2 className="text-2xl font-semibold mt-8 mb-2">📈 Trip History</h2>
      <HistoryTripTable trips={pastTrips} />
    </div>
  );
};

export default App;

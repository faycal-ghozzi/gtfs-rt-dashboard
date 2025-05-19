import React, { useEffect, useState } from 'react';
import { getTrips } from './api';
import TripTable from './components/TripTable';
import MapView from './components/MapView';
import StatsPanel from './components/StatsPanel';

const App = () => {
  const [trips, setTrips] = useState([]);

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
      <MapView trips={trips} />
      <TripTable trips={trips} />
    </div>
  );
};

export default App;
import React, { useState, useEffect } from 'react';
import TrainTripTable from './components/TrainTripTable';
import HistoryTripTable from './components/HistoryTripTable';
import StatsPanel from './components/StatsPanel';
import TripMapModal from './modals/TripMapModal';
import { getTrips } from './utils/api';
import { filterTrips } from './utils/filterTrips';

const App = () => {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [currentTrips, setCurrentTrips] = useState([]);
  const [pastTrips, setPastTrips] = useState([]);
  const [currentView, setCurrentView] = useState('stats');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchTrips = async () => {
      try {
        const data = await getTrips();
        if (isMounted) {
          const { currentTrips, pastTrips } = filterTrips(data);
          setCurrentTrips(currentTrips);
          setPastTrips(pastTrips);
          setLoading(false);
          setLastUpdated(new Date().toLocaleTimeString());
        }
      } catch (err) {
        console.error("Failed to fetch trips:", err);
      }
    };

    fetchTrips();

    const interval = setInterval(fetchTrips, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-100 text-gray-800">
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <nav className="flex items-center justify-between px-8 py-3 border-b">
          <h1 className="text-xl font-bold text-blue-900">🚆 Tableau de bord des trains SNCF</h1>
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 rounded-md font-medium ${currentView === 'stats' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              onClick={() => setCurrentView('stats')}
            >
              📊 Statistiques
            </button>
            <button
              className={`px-4 py-2 rounded-md font-medium ${currentView === 'current' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              onClick={() => setCurrentView('current')}
            >
              ⏰ Horaires en cours
            </button>
            <button
              className={`px-4 py-2 rounded-md font-medium ${currentView === 'history' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              onClick={() => setCurrentView('history')}
            >
              🕘 Historique
            </button>
          </div>
        </nav>
      </header>

      <main className="w-full px-6 py-6">
        <div className="flex justify-end text-sm text-gray-500 mb-2">
          {lastUpdated && `Dernière mise à jour : ${lastUpdated}`}
        </div>

        {currentView === 'stats' && <StatsPanel trips={currentTrips} />}
        {currentView === 'current' && (
          <TrainTripTable trips={currentTrips} onViewTrip={setSelectedTrip} />
        )}
        {currentView === 'history' && <HistoryTripTable trips={pastTrips} />}
      </main>

      {selectedTrip && <TripMapModal trip={selectedTrip} onClose={() => setSelectedTrip(null)} />}
    </div>
  );
};

export default App;

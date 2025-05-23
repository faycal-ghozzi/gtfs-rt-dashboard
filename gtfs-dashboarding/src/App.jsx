import React, { useState, useEffect } from 'react';
import TrainTripTable from './components/TrainTripTable';
import HistoryTripTable from './components/HistoryTripTable';
import StatsPanel from './components/StatsPanel';
import TripMapModal from './modals/TripMapModal';
import { getTrips, getHistory } from './utils/api';
import { filterTrips } from './utils/filterTrips';

const App = () => {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [currentTrips, setCurrentTrips] = useState([]);
  const [pastTrips, setPastTrips] = useState([]);
  const [currentView, setCurrentView] = useState('stats');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchTrips = async () => {
      try {
        const liveData = await getTrips();
        const historyData = await getHistory();

        if (isMounted) {
          setCurrentTrips(filterTrips(liveData));
          setPastTrips(filterTrips(historyData, true));
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
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen w-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100">
        <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm">
          <nav className="flex items-center justify-between px-8 py-3 border-b dark:border-gray-700">
            <h1 className="text-xl font-bold text-blue-900 dark:text-blue-300">
              🚆 Tableau de bord des trains SNCF
            </h1>
            <div className="flex space-x-4 items-center">
              <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">☀️</span>
              <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={() => setDarkMode(!darkMode)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 dark:bg-gray-600 rounded-full peer dark:peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
                </label>
                <span className="text-sm text-gray-700 dark:text-gray-300">🌙</span>
              </div>
              {['stats', 'current', 'history'].map((view) => (
                <button
                  key={view}
                  className={`px-4 py-2 rounded-md font-medium ${
                    currentView === view
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                  }`}
                  onClick={() => setCurrentView(view)}
                >
                  {view === 'stats'
                    ? '📊 Statistiques'
                    : view === 'current'
                    ? '⏰ Horaires en cours'
                    : '🕘 Historique'}
                </button>
              ))}
            </div>
          </nav>
        </header>

        <main className="w-full px-6 py-6">
          <div className="flex justify-end text-sm text-gray-500 dark:text-gray-400 mb-2">
            {lastUpdated && `Dernière mise à jour : ${lastUpdated}`}
          </div>

          {currentView === 'stats' && <StatsPanel trips={currentTrips} pastTrips={pastTrips} darkMode={darkMode} />}
          {currentView === 'current' && (
            <TrainTripTable trips={currentTrips} onViewTrip={setSelectedTrip} darkMode={darkMode} />
          )}
          {currentView === 'history' && <HistoryTripTable trips={pastTrips} onViewTrip={setSelectedTrip} darkMode={darkMode} />}
        </main>

        {selectedTrip && <TripMapModal trip={selectedTrip} onClose={() => setSelectedTrip(null)} darkMode={darkMode}/>}
      </div>
    </div>
  );
};

export default App;

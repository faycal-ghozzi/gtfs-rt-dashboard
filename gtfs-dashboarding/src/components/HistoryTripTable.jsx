import React, { useState, useMemo } from 'react';
import DataTable, { createTheme } from 'react-data-table-component';
import { DateTime } from 'luxon';
import { getTripStatus } from '../utils/getTripStatus';
import ExpandableTripDetails from './ExpandableTripDetails';
import { getRegionFromCoords } from '../utils/regions';
import RegionDropdown from './RegionDropdown';

createTheme('tailwindDark', {
  text: { primary: '#f3f4f6', secondary: '#9ca3af' },
  background: { default: '#1f2937' },
  context: { background: '#374151', text: '#ffffff' },
  divider: { default: '#4b5563' },
  action: {
    button: 'rgba(255,255,255,0.54)',
    hover: 'rgba(255,255,255,0.08)',
    disabled: 'rgba(255,255,255,0.12)',
  },
}, 'dark');

// Parse delay strings to numeric minutes
const parseDelayMinutes = (delayStr) => {
  if (!delayStr || delayStr === 'on time') return 0;
  if (delayStr.includes('h')) {
    const parts = delayStr.split(' ').filter(Boolean);
    const hours = parseInt(parts[0], 10);
    const minutes = parts[1]?.includes('min') ? parseInt(parts[1], 10) : 0;
    return (isNaN(hours) ? 0 : hours * 60) + (isNaN(minutes) ? 0 : minutes);
  }
  if (delayStr.includes('min')) {
    const minutes = parseInt(delayStr, 10);
    return isNaN(minutes) ? 0 : minutes;
  }
  return 0;
};

const HistoryTripTable = ({ trips, onViewTrip, darkMode }) => {
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [departureRegion, setDepartureRegion] = useState('Toutes');
  const [arrivalRegion, setArrivalRegion] = useState('Toutes');

  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      const tripDate = DateTime.fromFormat(trip.start_date, 'yyyyLLdd');

      const matchesSearch = !search.trim() || trip.stops.some(stop =>
        stop.stop_name.toLowerCase().includes(search.toLowerCase())
      );

      const isAfterFrom = !fromDate || tripDate >= DateTime.fromISO(fromDate);
      const isBeforeTo = !toDate || tripDate <= DateTime.fromISO(toDate);

      const firstStop = trip.stops[0];
      const lastStop = trip.stops.at(-1);

      const depRegion = firstStop?.stop_lat && firstStop?.stop_lon
        ? getRegionFromCoords(firstStop.stop_lat, firstStop.stop_lon)
        : null;

      const arrRegion = lastStop?.stop_lat && lastStop?.stop_lon
        ? getRegionFromCoords(lastStop.stop_lat, lastStop.stop_lon)
        : null;

      const matchesDepRegion = departureRegion === 'Toutes' || depRegion === departureRegion;
      const matchesArrRegion = arrivalRegion === 'Toutes' || arrRegion === arrivalRegion;

      return matchesSearch && isAfterFrom && isBeforeTo && matchesDepRegion && matchesArrRegion;
    });
  }, [search, fromDate, toDate, departureRegion, arrivalRegion, trips]);

  const columns = [
    {
      name: 'Date',
      selector: row => DateTime.fromFormat(row.start_date, 'yyyyLLdd').toFormat('dd/MM/yyyy'),
      sortable: true,
    },
    {
      name: 'Départ',
      selector: row => row.stops[0]?.stop_name || '-',
      sortable: true,
    },
    {
      name: 'Heure Départ',
      selector: row => row.stops[0]?.departure || '-',
      sortable: true,
    },
    {
      name: 'Arrivée',
      selector: row => row.stops.at(-1)?.stop_name || '-',
      sortable: true,
    },
    {
      name: 'Heure Arrivée',
      selector: row => row.stops.at(-1)?.arrival || '-',
      sortable: true,
    },
    {
      name: 'Statut',
      cell: row => <span className="text-sm">Terminé</span>,
    },
    {
      name: 'Retard',
      selector: row => parseDelayMinutes(row.stops.at(-1)?.delay),
      format: row => {
        const delay = row.stops.at(-1)?.delay;
        return delay === 'on time' ? "à l'heure" : delay || '—';
      },
      sortable: true,
      right: true,
    },
  ];

  const conditionalRowStyles = [
    {
      when: row => {
        const delay = parseDelayMinutes(row.stops.at(-1)?.delay);
        return delay >= 2 && delay < 10;
      },
      style: {
        backgroundColor: darkMode ? '#fef3c7' : '#fff9db',
        color: darkMode ? '#1f2937' : '#111827',
      },
    },
    {
      when: row => {
        const delay = parseDelayMinutes(row.stops.at(-1)?.delay);
        return delay >= 10 && delay < 30;
      },
      style: {
        backgroundColor: darkMode ? '#fde68a' : '#ffedd5',
        color: darkMode ? '#1f2937' : '#111827',
      },
    },
    {
      when: row => {
        const delay = parseDelayMinutes(row.stops.at(-1)?.delay);
        return delay >= 30;
      },
      style: {
        backgroundColor: darkMode ? '#fecaca' : '#fee2e2',
        color: darkMode ? '#1f2937' : '#111827',
      },
    },
  ];

  return (
    <div className="w-full">
      <div className="mb-4 space-y-4 px-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <input
            type="text"
            placeholder="Recherche par station..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-3 py-1 text-sm shadow-sm w-full sm:w-72 bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600"
          />
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">Du</label>
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm shadow-sm bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600"
            />
            <label className="text-sm text-gray-700 dark:text-gray-300">au</label>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm shadow-sm bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <RegionDropdown
            label="Région de départ"
            selectedRegion={departureRegion}
            onChange={setDepartureRegion}
          />
          <RegionDropdown
            label="Région d'arrivée"
            selectedRegion={arrivalRegion}
            onChange={setArrivalRegion}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredTrips || []}
        pagination
        highlightOnHover
        striped
        theme={darkMode ? 'tailwindDark' : 'default'}
        expandableRows
        expandableRowsComponent={({ data }) => (
          <ExpandableTripDetails data={data} onViewTrip={onViewTrip} darkMode={darkMode} isHistory={true}/>
        )}
        expandOnRowClicked
        conditionalRowStyles={conditionalRowStyles}
      />
    </div>
  );
};

export default HistoryTripTable;

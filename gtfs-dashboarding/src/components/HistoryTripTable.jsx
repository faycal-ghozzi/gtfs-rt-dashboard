import React, { useState, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import { DateTime } from 'luxon';
import { getTripStatus } from '../utils/getTripStatus';
import ExpandableTripDetails from './ExpandableTripDetails';

const HistoryTripTable = ({ trips, onViewTrip }) => {
  const [search, setSearch] = useState('');

  const filteredTrips = useMemo(() => {
    if (!search.trim()) return trips;
    const lower = search.toLowerCase();
    return trips.filter(trip =>
      trip.stops.some(stop => stop.stop_name.toLowerCase().includes(lower))
    );
  }, [search, trips]);

  const columns = [
    {
      name: 'Date',
      selector: row => DateTime.fromFormat(row.start_date, 'yyyyLLdd').toFormat('dd/MM/yyyy'),
    },
    {
      name: 'Départ prévu',
      selector: row => row.stops[0]?.departure || '-',
    },
    {
      name: 'Arrivée prévue',
      selector: row => row.stops.at(-1)?.arrival || '-',
    },
    {
      name: 'Trajet',
      selector: row =>
        `${row.stops[0]?.stop_name || '-'} ➝ ${row.stops.at(-1)?.stop_name || '-'}`,
    },
    {
      name: 'Statut du train',
      cell: row => <span className="text-sm">{getTripStatus(row)}</span>,
    },
  ];

  return (
    <div className="w-full">
      <div className="flex justify-end mb-2 px-2">
        <input
          type="text"
          placeholder="Recherche par station..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-1 text-sm w-72 shadow-sm"
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredTrips || []}
        pagination
        highlightOnHover
        striped
        expandableRows
        expandableRowsComponent={({ data }) => (
          <ExpandableTripDetails data={data} onViewTrip={onViewTrip} />
        )}
        expandOnRowClicked
      />
    </div>
  );
};

export default HistoryTripTable;

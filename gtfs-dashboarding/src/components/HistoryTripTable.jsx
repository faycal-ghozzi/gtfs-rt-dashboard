import React from 'react';
import DataTable from 'react-data-table-component';
import { DateTime } from 'luxon';

const HistoryTripTable = ({ trips }) => {
  const columns = [
    {
      name: 'Start Date',
      selector: row => DateTime.fromFormat(row.start_date, 'yyyyLLdd').toFormat('dd/MM/yyyy'),
      sortable: true,
    },
    {
      name: 'Departure',
      selector: row => row.stops[0]?.departure || '-',
      sortable: true,
    },
    {
      name: 'Arrival',
      selector: row => row.stops.at(-1)?.arrival || '-',
      sortable: true,
    },
    {
      name: 'From ➝ To',
      selector: row => `${row.stops[0]?.stop_name || '-'} ➝ ${row.stops.at(-1)?.stop_name || '-'}`,
      sortable: true,
    },
    {
      name: 'Duration',
      selector: row => {
        const start = DateTime.fromFormat(row.stops[0]?.departure || '', 'HH:mm', { zone: 'Europe/Paris' });
        const end = DateTime.fromFormat(row.stops.at(-1)?.arrival || '', 'HH:mm', { zone: 'Europe/Paris' });
        return (start.isValid && end.isValid)
          ? `${end.diff(start, 'minutes').minutes.toFixed(0)} min`
          : '-';
      },
      sortable: true,
      right: true,
    },
    {
      name: 'Details',
      cell: row => (
        <button
          className="text-purple-600 underline hover:text-purple-800"
          onClick={() => handleDetailsClick(row)}
        >
          Stats
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    }
  ];

  const handleDetailsClick = (trip) => {
    console.log("Trip history stats:", trip);
  };

  return (
    <div className="mt-6">
      <DataTable
        columns={columns}
        data={trips}
        pagination
        highlightOnHover
        striped
        responsive
      />
    </div>
  );
};

export default HistoryTripTable;

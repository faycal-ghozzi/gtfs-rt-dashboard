import React, { useState, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import { DateTime } from 'luxon';
import { getTripStatus } from '../utils/getTripStatus';
import ExpandableTripDetails from './ExpandableTripDetails';
import { getRegionFromCoords } from '../utils/regions';
import RegionDropdown from './RegionDropdown';

const HistoryTripTable = ({ trips, onViewTrip }) => {
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
            <div className="mb-4 space-y-4 px-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <input
                        type="text"
                        placeholder="Recherche par station..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="border rounded px-3 py-1 text-sm shadow-sm w-full sm:w-72"
                    />

                    <div className="flex items-center space-x-2">
                        <label className="text-sm">Du</label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={e => setFromDate(e.target.value)}
                            className="border rounded px-2 py-1 text-sm shadow-sm"
                        />
                        <label className="text-sm">au</label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={e => setToDate(e.target.value)}
                            className="border rounded px-2 py-1 text-sm shadow-sm"
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

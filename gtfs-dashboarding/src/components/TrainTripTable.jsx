import React, { useState, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import { DateTime } from 'luxon';
import { getTripStatus } from '../utils/getTripStatus';
import ExpandableTripDetails from './ExpandableTripDetails';
import { getRegionFromCoords } from '../utils/regions';
import RegionDropdown from './RegionDropdown';

const TrainTripTable = ({ trips, onViewTrip }) => {
    const [search, setSearch] = useState('');
    const [departureRegion, setDepartureRegion] = useState('Toutes');
    const [arrivalRegion, setArrivalRegion] = useState('Toutes');

    const filteredTrips = useMemo(() => {
        return trips.filter(trip => {
            const matchesSearch = !search.trim() || trip.stops.some(stop =>
                stop.stop_name.toLowerCase().includes(search.toLowerCase())
            );

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

            return matchesSearch && matchesDepRegion && matchesArrRegion;
        });
    }, [search, departureRegion, arrivalRegion, trips]);

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
            <div className="mb-4 px-2 space-y-4">
                <div className="flex justify-between flex-wrap items-center gap-4">
                    <input
                        type="text"
                        placeholder="Recherche par station..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="border rounded px-3 py-1 text-sm shadow-sm w-full sm:w-72"
                    />
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

export default TrainTripTable;

import React, { useState, useMemo } from 'react';
import DataTable, { createTheme } from 'react-data-table-component';
import { getTripStatus } from '../utils/getTripStatus';
import ExpandableTripDetails from './ExpandableTripDetails';
import { getRegionFromCoords } from '../utils/regions';
import RegionDropdown from './RegionDropdown';

createTheme('tailwindDark', {
    text: {
        primary: '#f3f4f6',
        secondary: '#9ca3af',
    },
    background: {
        default: '#1f2937',
    },
    context: {
        background: '#374151',
        text: '#ffffff',
    },
    divider: {
        default: '#4b5563',
    },
    action: {
        button: 'rgba(255,255,255,0.54)',
        hover: 'rgba(255,255,255,0.08)',
        disabled: 'rgba(255,255,255,0.12)',
    },
}, 'dark');

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

const TrainTripTable = ({ trips, onViewTrip, darkMode }) => {
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
            cell: row => <span className="text-sm">{getTripStatus(row)}</span>,
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
        }
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
            <div className="mb-4 px-2 space-y-4">
                <div className="flex justify-between flex-wrap items-center gap-4">
                    <input
                        type="text"
                        placeholder="Recherche par station..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="border rounded px-3 py-1 text-sm shadow-sm w-full sm:w-72 bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600"
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
                theme={darkMode ? 'tailwindDark' : 'default'}
                expandableRows
                expandableRowsComponent={({ data }) => (
                    <ExpandableTripDetails data={data} onViewTrip={onViewTrip} darkMode={darkMode} />
                )}
                expandOnRowClicked
                conditionalRowStyles={conditionalRowStyles}
            />
        </div>
    );
};

export default TrainTripTable;

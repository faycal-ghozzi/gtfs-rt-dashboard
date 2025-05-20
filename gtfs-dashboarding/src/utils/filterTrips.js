import { DateTime } from 'luxon';
import { getTripStatus } from './getTripStatus';

export const filterTrips = (trips) => {
  const nowInParis = DateTime.now().setZone('Europe/Paris');
  const today = nowInParis.toFormat('yyyyLLdd');

  const currentTrips = [];
  const pastTrips = [];

  for (const trip of trips) {
    if (trip.start_date !== today) continue;

    const firstStop = trip.stops[0];
    const lastStop = trip.stops.at(-1);

    const missingEndpoints =
      !firstStop?.stop_name?.trim() ||
      !lastStop?.stop_name?.trim();

    if (missingEndpoints) continue;

    const status = getTripStatus(trip);

    if (status === 'Completed') {
      pastTrips.push(trip);
    } else {
      currentTrips.push(trip);
    }
  }

  return { currentTrips, pastTrips };
};

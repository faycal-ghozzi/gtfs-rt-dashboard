import { getTripStatus } from './getTripStatus';

export const filterTrips = (trips, past = false) => {
  const filtered = [];

  for (const trip of trips) {
    const firstStop = trip.stops[0];
    const lastStop = trip.stops.at(-1);

    const missingEndpoints =
      !firstStop?.stop_name?.trim() ||
      !lastStop?.stop_name?.trim();

    if (missingEndpoints) continue;

    const status = getTripStatus(trip);

    if (past) {
      if (status === 'Trajet terminé') {
        filtered.push(trip);
      }
    } else {
      if (status !== 'Trajet terminé') {
        filtered.push(trip);
      }
    }
  }

  return filtered;
};

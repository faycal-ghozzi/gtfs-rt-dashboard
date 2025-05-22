import { getTripStatus } from "./getTripStatus";
import { DateTime } from "luxon";

export const filterTrips = (trips, past = false) => {
  const now = DateTime.now().setZone("Europe/Paris");
  const today = now.toFormat("yyyyLLdd");
  const currentTime = now.toFormat("HH:mm");

  const filtered = [];

  for (const trip of trips) {
    const firstStop = trip.stops[0];
    const lastStop = trip.stops.at(-1);

    const missingEndpoints =
      !firstStop?.stop_name?.trim() || !lastStop?.stop_name?.trim();

    if (missingEndpoints) continue;

    const status = getTripStatus(trip);
    const tripDate = trip.start_date;

    const isFutureDate = tripDate > today;
    const isToday = tripDate === today;
    const startsLaterToday = isToday && trip.start_time >= currentTime;

    if (past) {
      if (status === "Trajet terminé" && !isFutureDate) {
        filtered.push(trip);
      }
    } else {
      if (
        status !== "Trajet terminé" &&
        (isFutureDate || startsLaterToday || isToday)
      ) {
        filtered.push(trip);
      }
    }
  }

  return filtered;
};

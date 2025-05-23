import { DateTime } from "luxon";

export const getTripStatus = (trip) => {
  const now = DateTime.now().setZone("Europe/Paris");

  // Parse trip date from yyyyLLdd
  const tripDate = DateTime.fromFormat(trip.start_date, "yyyyLLdd", {
    zone: "Europe/Paris",
  });

  if (!tripDate.isValid) return "Trajet terminé";

  for (let stop of trip.stops) {
    if (stop.arrival) {
      const arr = DateTime.fromFormat(
        `${trip.start_date} ${stop.arrival}`,
        "yyyyLLdd HH:mm",
        { zone: "Europe/Paris" }
      );
      if (arr.isValid && now < arr) return `En approche de ${stop.stop_name}`;
    }

    if (stop.departure) {
      const dep = DateTime.fromFormat(
        `${trip.start_date} ${stop.departure}`,
        "yyyyLLdd HH:mm",
        { zone: "Europe/Paris" }
      );
      if (dep.isValid && now < dep) return `À ${stop.stop_name}`;
    }
  }

  return "Trajet terminé";
};

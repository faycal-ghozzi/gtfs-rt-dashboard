import { DateTime } from "luxon";

export const getTripStatus = (trip) => {
  const nowParis = DateTime.now().setZone("Europe/Paris");

  for (let stop of trip.stops) {
    const arr = DateTime.fromFormat(stop.arrival || "", "HH:mm", {
      zone: "Europe/Paris",
    });
    const dep = DateTime.fromFormat(stop.departure || "", "HH:mm", {
      zone: "Europe/Paris",
    });

    if (arr.isValid && nowParis < arr)
      return `En approche de ${stop.stop_name}`;
    if (dep.isValid && nowParis < dep) return `À ${stop.stop_name}`;
  }

  return "Trajet terminé";
};

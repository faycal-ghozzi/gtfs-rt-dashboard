from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
from dotenv import load_dotenv
import os
from gtfs_rt import fetch_trip_updates
from stops_loader import load_gares, load_additional_stops

load_dotenv()
gares_data = load_gares('data/liste-des-gares.csv')
additional_stops_data = load_additional_stops('data/stops_update.txt')


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_methods = ["*"],
    allow_headers = ["*"]
)

GTFS_RT_URL = os.getenv("GTFS_RT_URL")

def human_readable_delay(delay):
    if delay is None or delay == 0:
        return "on time"
    elif delay >= 3600:
        hours = round(delay / 3600)
        return f"{hours} h"
    elif delay >= 60:
        return f"{round(delay / 60)} min"
    else:
        return f"{delay} sec"
    
def convert_ts_human(ts):
    if ts is None:
        return None
    return datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%H:%M")

@app.get("/api/trips")
def get_trip_updates():
    entities = fetch_trip_updates(GTFS_RT_URL)
    results = []

    for entity in entities:
        updates = []
        for stu in entity.trip_update.stop_time_update:
            code_uic = stu.stop_id.split('-')[-1] if '-' in stu.stop_id else stu.stop_id
            stop_info = gares_data.get(code_uic)

            if not stop_info:
                stop_info = additional_stops_data.get(stu.stop_id)

            arrival_ts = getattr(stu.arrival, "time", None)
            departure_ts = getattr(stu.departure, "time", None)

            updates.append({
                "stop_id": stu.stop_id,
                "stop_name": stop_info.get("stop_name", "") if stop_info else "",
                "arrival": convert_ts_human(arrival_ts),
                "departure": convert_ts_human(departure_ts),
                "delay": human_readable_delay(getattr(stu.arrival, "delay", 0)),
                "stop_lat": stop_info.get("stop_lat") if stop_info else None,
                "stop_lon": stop_info.get("stop_lon") if stop_info else None
            })

        results.append({
            "trip_id": entity.trip_update.trip.trip_id,
            "start_time": entity.trip_update.trip.start_time,
            "start_date": entity.trip_update.trip.start_date,
            "stops": updates
        })

    return results


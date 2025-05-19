from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
from dotenv import load_dotenv
import os
from gtfs_rt import fetch_trip_updates
from stops_loader import load_stops

load_dotenv()

app = FastAPI()
stops_data = load_stops()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_methods = ["*"],
    allow_headers = ["*"]
)

GTFS_RT_URL = os.getenv("GTFS_RT_URL")

def convert_ts_human(ts):
    return datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%H:%M") if ts else None

@app.get("/api/trips")
def get_trip_updates():
    entities = fetch_trip_updates(GTFS_RT_URL)
    results = []

    for entity in entities:
        updates = []
        for stu in entity.trip_update.stop_time_update:
            stop_info = stops_data.get(stu.stop_id, {})
            updates.append({
                "stop_id": stu.stop_id,
                "stop_name": stop_info.get("stop_name", ""),
                "arrival": getattr(stu.arrival, "time", None),
                "departure": getattr(stu.departure, "time", None),
                "delay": getattr(stu.arrival, "delay", 0)
            })
        results.append({
            "trip_id": entity.trip_update.trip.trip_id,
            "start_time": entity.trip_update.trip.start_time,
            "start_date": entity.trip_update.trip.start_date,
            "stops": updates
        })
    return results
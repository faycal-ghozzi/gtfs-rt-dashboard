from fastapi import FastAPI
import requests
from google.transit import gtfs_realtime_pb2
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_methods = ["*"],
    allow_headers = ["*"]
)

GTFS_RT_URL = os.getenv("GTFS_RT_URL")

def convert_ts_human(ts):
    return datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%H:%M") if ts else None

def fetch_trip_update_data(trip_update):
    tu = trip_update
    trip = {
        "trip_id" : tu.trip.trip_id,
        "start_time" : tu.trip.start_time,
        "timestamp" : tu.timestamp,
        "stops" : []
    }

    for stu in tu.stop_time_update:
        trip["stops"].append({
            "stop_code" : stu.stop_id,
            "arrival_time" : convert_ts_human(stu.arrival.time) if stu.HasField("arrival") else None,
            "departure_time" : convert_ts_human(stu.departure.time) if stu.HasField("departure") else None
        })
    
    return trip

@app.get("/api/gtfs-rt")
def get_gtfs_data():
    feed = gtfs_realtime_pb2.FeedMessage()
    response = requests.get(GTFS_RT_URL)

    if response.status_code != 200:
        return {"errure": "Impossible de récumpérer les données GTFS-RT"}
    
    feed.ParseFromString(response.content)

    trips = []
    vehicles = []
    alerts = []

    for entity in feed.entity:
        if entity.HasField("trip_update"):
            trip = fetch_trip_update_data(entity.trip_update)

            trips.append(trip)

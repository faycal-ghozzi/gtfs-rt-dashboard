from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
from dotenv import load_dotenv
import os
from gtfs_rt import fetch_trip_updates

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

@app.get("/api/trips")
def get_gtfs_data():
    entities = fetch_trip_updates(GTFS_RT_URL)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
from dotenv import load_dotenv
from sqlmodel import SQLModel, create_engine, Session, select
import os
import json

from gtfs_rt import fetch_trip_updates
from stops_loader import load_gares, load_additional_stops
from models import Trip, StopUpdate

load_dotenv()

gares_data = load_gares('data/liste-des-gares.csv')
additional_stops_data = load_additional_stops('data/stops_update.txt')
GTFS_RT_URL = os.getenv("GTFS_RT_URL")

DATABASE_URL = "sqlite:///data/trips.db"
engine = create_engine(DATABASE_URL, echo=False)

def create_db():
    SQLModel.metadata.create_all(engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

def human_readable_delay(delay):
    if delay is None or delay == 0:
        return "on time"
    elif delay >= 3600:
        return f"{round(delay / 3600)} h"
    elif delay >= 60:
        return f"{round(delay / 60)} min"
    return f"{delay} sec"

def convert_ts_human(ts):
    if ts is None:
        return None
    return datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%H:%M")

@app.get("/api/trips")
def get_trip_updates():
    entities = fetch_trip_updates(GTFS_RT_URL)
    results = []

    with Session(engine) as session:
        for entity in entities:
            updates = []
            for stu in entity.trip_update.stop_time_update:
                code_uic = stu.stop_id.split('-')[-1] if '-' in stu.stop_id else stu.stop_id
                stop_info = gares_data.get(code_uic) or additional_stops_data.get(stu.stop_id)

                if not stop_info:
                    continue

                stop_name = stop_info.get("stop_name", "").strip()
                stop_lat = stop_info.get("stop_lat")
                stop_lon = stop_info.get("stop_lon")

                if not stop_name or stop_lat is None or stop_lon is None:
                    continue

                updates.append(StopUpdate(
                    stop_id=stu.stop_id,
                    stop_name=stop_name,
                    arrival=convert_ts_human(getattr(stu.arrival, "time", None)),
                    departure=convert_ts_human(getattr(stu.departure, "time", None)),
                    delay=human_readable_delay(getattr(stu.arrival, "delay", 0)),
                    stop_lat=stop_lat,
                    stop_lon=stop_lon
                ).dict())

            if len(updates) < 2:
                continue

            trip_dict = {
                "trip_id": entity.trip_update.trip.trip_id,
                "start_time": entity.trip_update.trip.start_time,
                "start_date": entity.trip_update.trip.start_date,
                "stops": updates
            }

            results.append(trip_dict)

            existing = session.exec(select(Trip).where(Trip.trip_id == trip_dict["trip_id"])).first()
            if existing:
                continue

            trip_model = Trip(
                trip_id=trip_dict["trip_id"],
                start_time=trip_dict["start_time"],
                start_date=trip_dict["start_date"],
                stops_json=json.dumps(trip_dict["stops"])
            )
            session.add(trip_model)

        session.commit()

    return results

@app.get("/api/history")
def get_saved_trips():
    with Session(engine) as session:
        trips = session.exec(select(Trip).order_by(Trip.created_at.desc())).all()
        result = []
        for trip in trips:
            result.append({
                "trip_id": trip.trip_id,
                "start_time": trip.start_time,
                "start_date": trip.start_date,
                "stops": json.loads(trip.stops_json),
                "created_at": trip.created_at.isoformat()
            })
        return result

create_db()

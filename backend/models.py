from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, timezone


class StopUpdate(SQLModel, table=False):
    stop_id: str
    stop_name: str
    arrival: Optional[str]
    departure: Optional[str]
    delay: Optional[str]
    stop_lat: Optional[float]
    stop_lon: Optional[float]


class Trip(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    trip_id: str = Field(index=True, unique=True)
    start_time: str
    start_date: str
    stops_json: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

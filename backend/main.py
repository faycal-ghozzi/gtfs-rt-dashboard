from fastapi import FastAPI
import requests
from google.transit import gtfs_realtime_pb2
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
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
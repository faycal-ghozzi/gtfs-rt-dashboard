import requests
from google.transit import gtfs_realtime_pb2

def fetch_trip_updates(url):
    feed = gtfs_realtime_pb2.FeedMessage()
    response = requests.get(url)
    feed.ParseFromString(response.content)
    return feed.entity
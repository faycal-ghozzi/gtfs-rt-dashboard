import csv

def load_stops(file_path='data/stops.txt'):
    stops = {}
    with open(file_path, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            stops[row['stop_id']] = row
    return stops
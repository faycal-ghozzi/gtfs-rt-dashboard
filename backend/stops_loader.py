import csv

def load_gares(file_path='data/liste-des-gares.csv'):
    gares = {}
    with open(file_path, newline='', encoding='utf-8-sig') as csvfile:
        reader = csv.DictReader(csvfile, delimiter=';')
        for row in reader:
            code_uic = row['CODE_UIC'].strip()
            print(row['VOYAGEURS'])
            gares[code_uic] = {
                "stop_name": row['LIBELLE'].strip(),
                "stop_lat": float(row['Y_WGS84']),
                "stop_lon": float(row['X_WGS84']),
            }
    return gares

def load_additional_stops(file_path='data/extra_stops.txt'):
    stops = {}
    with open(file_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            stops[row['stop_id']] = {
                "stop_name": row['stop_name'],
                "stop_lat": float(row['stop_lat']) if row['stop_lat'] else None,
                "stop_lon": float(row['stop_lon']) if row['stop_lon'] else None
            }
    return stops

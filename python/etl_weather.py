import requests
import json
from datetime import datetime
import os

class WeatherETL:
    @staticmethod
    def run():

        FILE_PATH = "data/weather.json"

        # -----------------------
        # 1. Leer datos existentes
        # -----------------------
        if os.path.exists(FILE_PATH):
            with open(FILE_PATH, "r") as f:
                existing_data = json.load(f)
                existing_records = existing_data["data"]
        else:
            existing_data = None
            existing_records = []

        # Crear set de timestamps existentes
        existing_timestamps = set([r["timestamp"] for r in existing_records])

        # -----------------------
        # 2. Llamar API
        # -----------------------
        url = "https://api.open-meteo.com/v1/forecast"

        params = {
            "latitude": 4.7110,
            "longitude": -74.0721,
            "hourly": "temperature_2m,relativehumidity_2m,precipitation,wind_speed_10m",
            "timezone": "America/Bogota"
        }

        response = requests.get(url, params=params)
        data = response.json()

        # -----------------------
        # 3. Transformar + filtrar nuevos datos
        # -----------------------
        new_records = []

        for i in range(len(data["hourly"]["time"])):
            ts = data["hourly"]["time"][i]

            if ts not in existing_timestamps:
                new_records.append({
                    "timestamp": ts,
                    "metrics": {
                        "temperature_c": data["hourly"]["temperature_2m"][i],
                        "humidity_pct": data["hourly"]["relativehumidity_2m"][i]
                    }
                })

        # -----------------------
        # 4. Merge
        # -----------------------
        all_records = existing_records + new_records

        # Ordenar por timestamp
        all_records = sorted(all_records, key=lambda x: x["timestamp"])

        # -----------------------
        # 5. Construir output final
        # -----------------------
        output = {
            "metadata": {
                "source": "open-meteo",
                "city": "Bogota",
                "timezone": "America/Bogota",
                "last_updated": datetime.utcnow().isoformat()
            },
            "data": all_records
        }

        # -----------------------
        # 6. Guardar
        # -----------------------
        with open(FILE_PATH, "w") as f:
            json.dump(output, f, indent=2)

        print(f"Registros nuevos añadidos: {len(new_records)}")
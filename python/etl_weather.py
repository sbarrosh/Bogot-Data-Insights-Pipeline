import requests
import json
from datetime import datetime

class WeatherETL:
    @staticmethod
    def run():
        url = "https://api.open-meteo.com/v1/forecast"

        params = {
            "latitude": 4.7110,
            "longitude": -74.0721,
            "hourly": "temperature_2m,relativehumidity_2m",
            "timezone": "America/Bogota"
        }

        response = requests.get(url, params=params)
        data = response.json()

        records = []

        for i in range(len(data["hourly"]["time"])):
            records.append({
                "timestamp": data["hourly"]["time"][i],
                "metrics": {
                    "temperature_c": data["hourly"]["temperature_2m"][i],
                    "humidity_pct": data["hourly"]["relativehumidity_2m"][i]
                }
            })

        output = {
            "metadata": {
                "source": "open-meteo",
                "city": "Bogota",
                "timezone": "America/Bogota",
                "last_updated": datetime.utcnow().isoformat()
            },
            "data": records
        }

        with open("data/weather.json", "w") as f:
            json.dump(output, f, indent=2)
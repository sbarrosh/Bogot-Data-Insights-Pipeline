# 🌦️ Bogotá Data Insights Pipeline

ETL pipeline that extracts real-time weather data for **Bogotá, Colombia** from a public API, transforms and persists it incrementally, and visualizes it through an interactive web dashboard — all without a database engine.

---

## 🏗️ Architecture

```
Open-Meteo API (free, no key required)
        │
        ▼
┌──────────────────┐
│  ETL — Python    │  Extracts hourly weather data
│  etl_weather.py  │  Deduplicates by timestamp
│                  │  Merges with existing records
└──────────────────┘
        │
        ▼
┌──────────────────┐
│  dashboard/      │  JSON file as lightweight data store
│  data/weather.json│  (temperature, humidity — hourly)
└──────────────────┘
        │
        ▼
┌──────────────────┐
│  Web Dashboard   │  Pure HTML + CSS + JS
│  index.html      │  Charts with historical / forecast toggle
└──────────────────┘
```

---

## ⚙️ Tech Stack

| Tool | Purpose |
|---|---|
| Python 3.13 | ETL logic |
| Open-Meteo API | Free weather data source (no API key needed) |
| requests | HTTP calls to the API |
| JSON | Lightweight persistence layer |
| HTML / CSS / JavaScript | Interactive dashboard |
| Chart.js | Temperature and humidity charts |

---

## 📁 Project Structure

```
Bogotá-Data-Insights-Pipeline/
├── main.py                    # Entry point
├── orquestador.py             # Orchestrator
├── python/
│   └── etl_weather.py         # ETL: extract → transform → load
├── dashboard/
│   ├── index.html             # Web dashboard
│   ├── script.js              # Chart rendering + filters
│   ├── style.css              # Dashboard styles
│   └── data/
│       └── weather.json       # Persisted weather records
└── requirements.txt
```

---

## 🔄 Pipeline Flow

### 1. Extract
Calls the [Open-Meteo API](https://open-meteo.com/) with Bogotá's coordinates (`lat: 4.7110, lon: -74.0721`) to fetch hourly forecasts:
- Temperature (°C)
- Relative humidity (%)
- Precipitation (mm)
- Wind speed (km/h)

### 2. Transform
- Reads existing `weather.json` to get already-stored timestamps
- Filters out duplicate records using a timestamp set
- Sorts all records chronologically

### 3. Load
- Merges new records with existing data
- Writes back to `dashboard/data/weather.json` with metadata:
  ```json
  {
    "metadata": {
      "source": "open-meteo",
      "city": "Bogota",
      "timezone": "America/Bogota",
      "last_updated": "2026-04-23T21:48:36"
    },
    "data": [
      {
        "timestamp": "2026-04-09T00:00",
        "metrics": {
          "temperature_c": 12.3,
          "humidity_pct": 81
        }
      }
    ]
  }
  ```

### 4. Dashboard
The web dashboard (`index.html`) reads the JSON file and renders:
- **Historical** vs **Forecast** toggle
- **24h / 7d** range filters
- Temperature and humidity line charts

---

## 🚀 How to Run

### Prerequisites
- Python 3.10+
- Internet connection (for API calls)

### Setup

```bash
# Clone the repository
git clone https://github.com/sbarrosh/Bogot-Data-Insights-Pipeline.git
cd Bogot-Data-Insights-Pipeline

# Create virtual environment
python -m venv env
source env/bin/activate  # Windows: env\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the ETL
python main.py
```

### View Dashboard
Open `dashboard/index.html` directly in your browser — no server needed.

---

## 💡 Key Learnings

- Designing an **incremental ETL** that avoids reprocessing existing records using timestamp deduplication
- Using a **flat JSON file as a data store** — a pragmatic approach when no database is available
- Consuming a **REST API with query parameters** and handling paginated hourly data
- Building a **pure frontend dashboard** (no frameworks) that reads local JSON and renders dynamic charts
- Separating **extraction, transformation, and loading** into a clean, reusable class structure

---

## 🔜 Next Steps

- [ ] Store data in PostgreSQL instead of flat JSON
- [ ] Add precipitation and wind speed to the dashboard
- [ ] Schedule ETL runs with Apache Airflow or cron
- [ ] Add data quality checks (null values, out-of-range temperatures)
- [ ] Deploy dashboard to GitHub Pages

---

## 📦 Dependencies

```
requests
```
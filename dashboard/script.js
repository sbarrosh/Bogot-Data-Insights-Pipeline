let allData = [];
let currentMode = "historical";

let tempChart, humidityChart;

// ==========================
// FETCH DATA
// ==========================
fetch("data/weather.json")
  .then(res => res.json())
  .then(data => {
    allData = data.data || [];
    updateView("24h", document.querySelector(".filters button"));
  })
  .catch(err => console.error(err));

// ==========================
// MODE (HISTORICAL / FORECAST)
// ==========================
function setMode(mode, btn) {
  currentMode = mode;

  document.querySelectorAll(".mode-toggle button")
    .forEach(b => b.classList.remove("active"));

  btn.classList.add("active");

  updateView("24h");
}

// ==========================
// FILTERS
// ==========================
function updateView(range, btn) {

  if (btn) {
    document.querySelectorAll(".filters button")
      .forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  }

  const now = new Date();

  // HISTORICAL / FORECAST SPLIT
  let records = allData.filter(r => {
    const t = new Date(r.timestamp);
    return currentMode === "historical" ? t <= now : t > now;
  });

  // RANGE FILTER
  if (range === "24h") records = records.slice(-24);
  else if (range === "7d") records = records.slice(-168);

  updateDateRange(records, range);
  render(records);
}

// ==========================
// DATE RANGE
// ==========================
function updateDateRange(records, range) {
  if (!records.length) return;

  const start = new Date(records[0].timestamp);
  const end = new Date(records.at(-1).timestamp);

  const format = d =>
    d.toLocaleString("es-CO", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });

  const label =
    currentMode === "forecast"
      ? "Pronóstico"
      : range === "24h"
      ? "Últimas 24h"
      : range === "7d"
      ? "Últimos 7 días"
      : "Histórico";

  document.getElementById("dateRange").innerText =
    `${label} • ${format(start)} → ${format(end)}`;
}

// ==========================
// MAIN RENDER
// ==========================
function render(records) {
  if (!records.length) return;

  const temp = records.map(r => r.metrics.temperature_c);
  const humidity = records.map(r => r.metrics.humidity_pct);

  const labels = records.map(r => {
    const d = new Date(r.timestamp);
    return d.getHours() + ":00";
  });

  // KPIs
  document.getElementById("temp").innerText = temp.at(-1) + " °C";
  document.getElementById("humidity").innerText = humidity.at(-1) + " %";
  document.getElementById("avgTemp").innerText =
    (temp.reduce((a,b)=>a+b,0)/temp.length).toFixed(1) + " °C";
  document.getElementById("maxTemp").innerText = Math.max(...temp) + " °C";
  document.getElementById("minTemp").innerText = Math.min(...temp) + " °C";

  // RESET CHARTS
  if (tempChart) tempChart.destroy();
  if (humidityChart) humidityChart.destroy();

  // TEMP CHART
  tempChart = new Chart(document.getElementById("tempChart"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Temperature",
        data: temp,
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56,189,248,0.2)",
        fill: true,
        tension: 0.4,
        pointRadius: 2
      }]
    },
    options: chartOptions()
  });

  // HUMIDITY CHART
  humidityChart = new Chart(document.getElementById("humidityChart"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Humidity",
        data: humidity,
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.2)",
        fill: true,
        tension: 0.4,
        pointRadius: 2
      }]
    },
    options: chartOptions()
  });

  renderInsights(records);

  // 🔥 SIEMPRE render forecast arriba
  renderDailyForecast();
}

// ==========================
// CHART OPTIONS (DARK)
// ==========================
function chartOptions() {
  return {
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { ticks: { color: "#94a3b8" } },
      y: { ticks: { color: "#94a3b8" } }
    }
  };
}

// ==========================
// INSIGHTS
// ==========================
function renderInsights(records) {
  const temps = records.map(r => r.metrics.temperature_c);

  const container = document.getElementById("insightsList");
  container.innerHTML = "";

  const data = [
    ["Promedio", (temps.reduce((a,b)=>a+b,0)/temps.length).toFixed(1) + " °C"],
    ["Máxima", Math.max(...temps) + " °C"],
    ["Mínima", Math.min(...temps) + " °C"],
    ["Tendencia",
      temps.at(-1) > temps[0] ? "📈 Subiendo" :
      temps.at(-1) < temps[0] ? "📉 Bajando" :
      "➖ Estable"]
  ];

  data.forEach(([title, value]) => {
    const div = document.createElement("div");
    div.className = "insight-card";

    div.innerHTML = `
      <div>${title}</div>
      <strong>${value}</strong>
    `;

    container.appendChild(div);
  });
}

// ==========================
// ICON LOGIC
// ==========================
function getWeatherIcon(temp) {
  if (temp > 20) return "☀️";
  if (temp > 15) return "⛅";
  if (temp > 10) return "🌧️";
  return "❄️";
}

// ==========================
// DAILY FORECAST (FIXED)
// ==========================
function renderDailyForecast() {

  const now = new Date();

  const futureData = allData.filter(r => new Date(r.timestamp) > now);

  const container = document.getElementById("dailyForecastContainer");
  container.innerHTML = "";

  if (!futureData.length) {
    container.innerHTML = "<span style='color:#94a3b8'>No forecast available</span>";
    return;
  }

  const grouped = {};

  futureData.forEach(r => {
    const day = r.timestamp.split("T")[0];
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(r.metrics.temperature_c);
  });

  Object.keys(grouped).slice(0, 6).forEach(day => {

    const temps = grouped[day];
    const avg = temps.reduce((a,b)=>a+b,0)/temps.length;

    const date = new Date(day);
    const name = date.toLocaleDateString("es-CO", { weekday: "short" });

    const icon = getWeatherIcon(avg);

    const div = document.createElement("div");
    div.className = "day-card";

    div.innerHTML = `
      <div class="day-name">${name}</div>
      <div class="day-icon">${icon}</div>
      <div class="day-temp">${avg.toFixed(1)}°C</div>
    `;

    container.appendChild(div);
  });
}
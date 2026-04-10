let allData = [];

let tempChartInstance = null;
let humidityChartInstance = null;
let dailyChartInstance = null;

// Fetch data
fetch("data/weather.json")
  .then(res => res.json())
  .then(data => {
    allData = data.data;
    updateView("24h"); // default
  });

// Update view based on filter
function updateView(range) {
  let filtered;

  if (range === "24h") {
    filtered = allData.slice(-24);
  } else if (range === "7d") {
    filtered = allData.slice(-168);
  } else {
    filtered = allData;
  }

  renderCharts(filtered);
}

// Render charts + KPIs
function renderCharts(records) {

  const labels = records.map(r => r.timestamp);
  const temp = records.map(r => r.metrics.temperature_c);
  const humidity = records.map(r => r.metrics.humidity_pct);

  // KPIs
  const avg = (temp.reduce((a, b) => a + b, 0) / temp.length).toFixed(1);
  const max = Math.max(...temp);
  const min = Math.min(...temp);

  document.getElementById("temp").innerText = temp[temp.length - 1] + " °C";
  document.getElementById("humidity").innerText = humidity[humidity.length - 1] + " %";
  document.getElementById("avgTemp").innerText = avg + " °C";
  document.getElementById("maxTemp").innerText = max + " °C";
  document.getElementById("minTemp").innerText = min + " °C";

  // Destroy old charts (important)
  if (tempChartInstance) tempChartInstance.destroy();
  if (humidityChartInstance) humidityChartInstance.destroy();
  if (dailyChartInstance) dailyChartInstance.destroy();

  // Temperature chart
  tempChartInstance = new Chart(document.getElementById("tempChart"), {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Temperature (°C)",
        data: temp
      }]
    }
  });

  // Humidity chart
  humidityChartInstance = new Chart(document.getElementById("humidityChart"), {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Humidity (%)",
        data: humidity
      }]
    }
  });

  // Daily aggregation
  const daily = groupByDay(records);

  const dailyLabels = daily.map(d => d.day);
  const dailyTemp = daily.map(d => d.avg_temp);

  dailyChartInstance = new Chart(document.getElementById("dailyChart"), {
    type: "bar",
    data: {
      labels: dailyLabels,
      datasets: [{
        label: "Avg Temp per Day",
        data: dailyTemp
      }]
    }
  });
}

// Group by day (aggregation)
function groupByDay(records) {
  const grouped = {};

  records.forEach(r => {
    const day = r.timestamp.split("T")[0];

    if (!grouped[day]) {
      grouped[day] = [];
    }

    grouped[day].push(r.metrics.temperature_c);
  });

  const result = [];

  for (let day in grouped) {
    const temps = grouped[day];
    const avg = temps.reduce((a, b) => a + b, 0) / temps.length;

    result.push({
      day: day,
      avg_temp: avg
    });
  }

  return result;
}
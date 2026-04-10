fetch("data/weather.json")
  .then(res => res.json())
  .then(data => {

    const records = data.data;

    const labels = records.map(r => r.timestamp);
    const temp = records.map(r => r.metrics.temperature_c);
    const humidity = records.map(r => r.metrics.humidity_pct);

    // KPI
    document.getElementById("temp").innerText =
      temp[temp.length - 1] + " °C";

    document.getElementById("humidity").innerText =
      humidity[humidity.length - 1] + " %";

    // Temperature chart
    new Chart(document.getElementById("tempChart"), {
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
    new Chart(document.getElementById("humidityChart"), {
      type: "line",
      data: {
        labels: labels,
        datasets: [{
          label: "Humidity (%)",
          data: humidity
        }]
      }
    });

  });

  let allData = [];

fetch("data/weather.json")
  .then(res => res.json())
  .then(data => {
    allData = data.data;
    updateView("24h"); // default
  });

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
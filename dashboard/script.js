fetch("../data/weather.json")
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
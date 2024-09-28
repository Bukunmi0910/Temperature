// AverageTemperatureChart.jsx
import React, { useRef, useEffect, useState } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const AverageTemperatureChart = () => {
  const canvasRef = useRef(null);
  const [temperatureData, setTemperatureData] = useState([]);

  // Replace with your GeoApify and Meteostat API keys
  const geoApifyKey = '2654a31ce55847b3b889fd888aab4be9';
  const meteostatKey = '4823cc02b3mshad80bba1798167ap14ab6djsne39a06e277a3';

  const fetchCoordinates = async (location) => {
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${Dallas}&apiKey=${'2654a31ce55847b3b889fd888aab4be9'}`
    );
    const data = await response.json();
    return data.features[0]?.properties;
  };

  const fetchTemperatureData = async (lat, lon) => {
    const startDate = '2024-09-28';
    const endDate = '2024-10-05';
    const response = await fetch(
      `https://meteostat.p.rapidapi.com/point/daily?lat=${lat}&lon=${lon}&start=${startDate}&end=${endDate}`,
      {
        headers: {
          'x-rapidapi-host': 'meteostat.p.rapidapi.com',
          'x-rapidapi-key': meteostatKey,
        },
      }
    );
    const data = await response.json();
    return data.data;
  };

  useEffect(() => {
    const getTemperatureData = async () => {
      try {
        // Replace 'Toronto' with the location of interest
        const location = 'Toronto';
        const coordinates = await fetchCoordinates(location);

        if (coordinates) {
          const weatherData = await fetchTemperatureData(coordinates.lat, coordinates.lon);

          const dates = weatherData.map(entry => entry.date);
          const temperatures = weatherData.map(entry => entry.tavg);

          setTemperatureData({ dates, temperatures });
        }
      } catch (error) {
        console.error('Error fetching temperature data:', error);
      }
    };

    getTemperatureData();
  }, []);

  useEffect(() => {
    if (temperatureData.dates && temperatureData.temperatures) {
      const ctx = canvasRef.current.getContext('2d');
      const myChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: temperatureData.dates,
          datasets: [{
            label: 'Average Temperature (°C)',
            data: temperatureData.temperatures,
            fill: false,
            borderColor: '#42A5F5',
            backgroundColor: '#42A5F5',
            tension: 0.1,
            borderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: 'Average Temperature by Day',
              font: {
                size: 16,
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Date',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Temperature (°C)',
              },
              beginAtZero: true,
            }
          }
        },
      });

      // Cleanup chart instance on component unmount
      return () => {
        myChart.destroy();
      };
    }
  }, [temperatureData]);

  return <canvas ref={canvasRef} />;
};

export default AverageTemperatureChart;

import React, { useRef, useEffect, useState } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const AverageTemperatureChart = () => {
  // References and state variables
  const canvasRef = useRef(null);
  const [temperatureData, setTemperatureData] = useState({ dates: [], temperatures: [] });
  const [searchLocation, setSearchLocation] = useState('Toronto'); // Default search location
  const [error, setError] = useState(null);

  // Replace with your actual GeoApify and Meteostat API keys
  const geoApifyKey = 'fb30858ae8334d578980544a39c4f016';
  const meteostatKey = '4823cc02b3mshad80bba1798167ap14ab6djsne39a06e277a3';

  // Function to fetch coordinates from GeoApify API
  const fetchCoordinates = async (location) => {
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/search?text=${location}&apiKey=${geoApifyKey}`
      );

      if (!response.ok) throw new Error('Failed to fetch coordinates.');

      const data = await response.json();
      console.log("GeoApify response data:", data); // Log GeoApify response data

      if (data.features.length === 0) {
        console.warn('No coordinates found for the specified location.');
        return null;
      }

      return data.features[0]?.properties;
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      setError('Could not fetch location coordinates.');
      return null;
    }
  };

  // Function to fetch temperature data from Meteostat API
  const fetchTemperatureData = async (lat, lon) => {
    // Get the start and end dates for the past seven days
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 7);
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = today.toISOString().split('T')[0];

    try {
      const response = await fetch(
        `https://meteostat.p.rapidapi.com/point/daily?lat=${lat}&lon=${lon}&start=${startDateStr}&end=${endDateStr}`,
        {
          headers: {
            'x-rapidapi-host': 'meteostat.p.rapidapi.com',
            'x-rapidapi-key': '4823cc02b3mshad80bba1798167ap14ab6djsne39a06e277a3',
          },
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text(); // Get error message from response
        console.error('Response error:', errorMessage);
        throw new Error('Failed to fetch weather data.');
      }

      const data = await response.json();
      console.log("Meteostat response data:", data); // Log Meteostat response data
      return data.data || [];
    } catch (error) {
      console.error('Error fetching temperature data:', error);
      setError('Could not fetch temperature data.');
      return [];
    }
  };

  // Function to handle search button click
  const handleSearch = async () => {
    setError(null); // Clear previous errors
    try {
      const coordinates = await fetchCoordinates(searchLocation);

      if (coordinates) {
        const weatherData = await fetchTemperatureData(coordinates.lat, coordinates.lon);

        if (weatherData && weatherData.length > 0) {
          const dates = weatherData.map(entry => entry.date);
          const temperatures = weatherData.map(entry => entry.tavg);

          setTemperatureData({ dates, temperatures });
        } else {
          console.warn('No temperature data available for this location.');
          setError('No temperature data available for this location.');
        }
      } else {
        setError('Could not find coordinates for this location.');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('An error occurred while fetching data.');
    }
  };

  // Effect hook to update the chart when temperature data changes
  useEffect(() => {
    if (temperatureData.dates.length > 0 && temperatureData.temperatures.length > 0) {
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
          }],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: `Average Temperature for ${searchLocation} (Daily)`,
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
            },
          },
        },
      });

      // Cleanup chart instance on component unmount
      return () => {
        myChart.destroy();
      };
    }
  }, [temperatureData]);

  // Render the component UI
  return (
    <div>
      <input
        type="text"
        placeholder="Enter a location"
        value={searchLocation}
        onChange={(e) => setSearchLocation(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <canvas ref={canvasRef} />
    </div>
  );
};

export default AverageTemperatureChart;

// AverageTemperatureChart.jsx
import React, { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const AverageTemperatureChart = () => {
  const canvasRef = useRef(null);

  // Mock data for average temperature
  const data = {
    labels: [
      'January', 'February', 'March', 'April',
      'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December'
    ],
    datasets: [{
      label: 'Average Temperature (°C)',
      data: [5, 6, 10, 14, 18, 22, 25, 24, 20, 15, 10, 6],
      fill: false,
      borderColor: '#42A5F5', // Light blue color
      backgroundColor: '#42A5F5',
      tension: 0.1,
      borderWidth: 2,
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // Hide legend
      },
      title: {
        display: true,
        text: 'Average Temperature by Month', // Title
        font: {
          size: 16,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month', // X-axis label
        },
      },
      y: {
        title: {
          display: true,
          text: 'Temperature (°C)', // Y-axis label
        },
        beginAtZero: true,
      }
    }
  };

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    const myChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: options,
    });

    // Cleanup the chart instance on component unmount
    return () => {
      myChart.destroy();
    };
  }, [data, options]);

  return <canvas ref={canvasRef} />;
};

export default AverageTemperatureChart;

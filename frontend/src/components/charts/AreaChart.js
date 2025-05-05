'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

/**
 * Reusable Area Chart component
 * 
 * @param {Object} props
 * @param {Array} props.data - The data to display in the chart
 * @param {Array} props.labels - The labels for the x-axis
 * @param {string} props.label - The label for the dataset
 * @param {string} props.borderColor - The border color for the line
 * @param {string} props.backgroundColor - The background color for the area
 * @param {Object} props.options - Additional Chart.js options
 * @param {Function} props.onClick - Function to call when a data point is clicked
 */
const AreaChart = ({
  data,
  labels,
  label = 'Data',
  borderColor = 'rgba(54, 162, 235, 1)',
  backgroundColor = 'rgba(54, 162, 235, 0.2)',
  options = {},
  onClick = null
}) => {
  const chartData = {
    labels,
    datasets: [
      {
        label,
        data,
        borderColor,
        backgroundColor,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Merge default options with custom options
  const chartOptions = {
    ...defaultOptions,
    ...options,
    onClick: onClick ? (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        onClick(index, labels[index], data[index]);
      }
    } : undefined
  };

  return (
    <div className="h-64">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default AreaChart;

'use client';

import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Reusable Bar Chart component
 * 
 * @param {Object} props
 * @param {Array} props.data - The data to display in the chart
 * @param {Array} props.labels - The labels for the x-axis
 * @param {string} props.label - The label for the dataset
 * @param {string} props.backgroundColor - The background color for the bars
 * @param {string} props.borderColor - The border color for the bars
 * @param {Object} props.options - Additional Chart.js options
 * @param {Function} props.onClick - Function to call when a bar is clicked
 * @param {boolean} props.horizontal - Whether to display the chart horizontally
 */
const BarChart = ({
  data,
  labels,
  label = 'Data',
  backgroundColor = 'rgba(54, 162, 235, 0.6)',
  borderColor = 'rgba(54, 162, 235, 1)',
  options = {},
  onClick = null,
  horizontal = false
}) => {
  const chartData = {
    labels,
    datasets: [
      {
        label,
        data,
        backgroundColor,
        borderColor,
        borderWidth: 1,
      }
    ]
  };

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' : 'x',
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
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default BarChart;

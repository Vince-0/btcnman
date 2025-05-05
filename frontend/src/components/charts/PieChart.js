'use client';

import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

/**
 * Reusable Pie Chart component
 * 
 * @param {Object} props
 * @param {Array} props.data - The data to display in the chart
 * @param {Array} props.labels - The labels for the data points
 * @param {Array} props.backgroundColor - The background colors for the segments
 * @param {Array} props.borderColor - The border colors for the segments
 * @param {Object} props.options - Additional Chart.js options
 * @param {Function} props.onClick - Function to call when a segment is clicked
 */
const PieChart = ({
  data,
  labels,
  backgroundColor = [
    'rgba(54, 162, 235, 0.6)',
    'rgba(255, 99, 132, 0.6)',
    'rgba(255, 206, 86, 0.6)',
    'rgba(75, 192, 192, 0.6)',
    'rgba(153, 102, 255, 0.6)',
    'rgba(255, 159, 64, 0.6)'
  ],
  borderColor = [
    'rgba(54, 162, 235, 1)',
    'rgba(255, 99, 132, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)'
  ],
  options = {},
  onClick = null
}) => {
  const chartData = {
    labels,
    datasets: [
      {
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
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
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
      <Pie data={chartData} options={chartOptions} />
    </div>
  );
};

export default PieChart;

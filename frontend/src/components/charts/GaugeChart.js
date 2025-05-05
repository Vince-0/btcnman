'use client';

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
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
 * Reusable Gauge Chart component
 * 
 * @param {Object} props
 * @param {number} props.value - The current value to display
 * @param {number} props.min - The minimum value of the gauge
 * @param {number} props.max - The maximum value of the gauge
 * @param {string} props.label - The label for the gauge
 * @param {Array} props.colors - The colors for different segments of the gauge
 * @param {Array} props.thresholds - The thresholds for different colors (as percentages)
 * @param {Object} props.options - Additional Chart.js options
 */
const GaugeChart = ({
  value,
  min = 0,
  max = 100,
  label = 'Value',
  colors = ['#4CAF50', '#FFC107', '#F44336'], // Green, Yellow, Red
  thresholds = [33, 66], // Percentages for color changes
  options = {}
}) => {
  // Normalize value to be within min and max
  const normalizedValue = Math.min(Math.max(value, min), max);
  
  // Calculate percentage
  const percentage = ((normalizedValue - min) / (max - min)) * 100;
  
  // Determine color based on thresholds
  let color;
  if (percentage <= thresholds[0]) {
    color = colors[0];
  } else if (percentage <= thresholds[1]) {
    color = colors[1];
  } else {
    color = colors[2];
  }
  
  // Create data for the gauge
  const data = {
    datasets: [
      {
        data: [percentage, 100 - percentage],
        backgroundColor: [color, '#E0E0E0'],
        borderWidth: 0,
        circumference: 180,
        rotation: 270,
      }
    ]
  };

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      }
    },
    events: [] // Disable all events
  };

  // Merge default options with custom options
  const chartOptions = {
    ...defaultOptions,
    ...options
  };

  return (
    <div className="relative h-48">
      <Doughnut data={data} options={chartOptions} />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-bold">{normalizedValue}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  );
};

export default GaugeChart;

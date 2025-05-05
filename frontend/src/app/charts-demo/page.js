'use client';

import React, { useState } from 'react';
import { LineChart, PieChart, BarChart, AreaChart, GaugeChart } from '../../components/charts';

export default function ChartsDemo() {
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);

  // Sample data for the charts
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const lineData = [65, 59, 80, 81, 56, 55, 40, 45, 60, 70, 75, 80];
  
  const peerVersions = ['v28.1.0', 'v27.0.0', 'v26.0.0', 'v25.0.0', 'v24.0.0', 'Other'];
  const peerVersionData = [42, 28, 15, 8, 5, 2];
  
  const peerPings = ['<50ms', '50-100ms', '100-150ms', '150-200ms', '>200ms'];
  const peerPingData = [25, 35, 20, 15, 5];
  
  const areaData = [30, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90];
  
  const handleChartClick = (index, label, value) => {
    setSelectedDataPoint({ index, label, value });
    // In a real application, you might navigate to a related page
    console.log(`Clicked on ${label} with value ${value}`);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Chart Components Demo</h1>
      
      {selectedDataPoint && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          You clicked on: {selectedDataPoint.label} with value {selectedDataPoint.value}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Line Chart</h2>
          <LineChart 
            data={lineData} 
            labels={months} 
            label="Monthly Transactions"
            onClick={handleChartClick}
          />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Pie Chart</h2>
          <PieChart 
            data={peerVersionData} 
            labels={peerVersions}
            onClick={handleChartClick}
          />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Bar Chart</h2>
          <BarChart 
            data={peerPingData} 
            labels={peerPings} 
            label="Peer Ping Distribution"
            onClick={handleChartClick}
          />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Area Chart</h2>
          <AreaChart 
            data={areaData} 
            labels={months} 
            label="Mempool Growth"
            onClick={handleChartClick}
          />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Gauge Chart</h2>
          <GaugeChart 
            value={75} 
            min={0} 
            max={100} 
            label="CPU Usage"
          />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Horizontal Bar Chart</h2>
          <BarChart 
            data={peerPingData} 
            labels={peerPings} 
            label="Peer Ping Distribution"
            onClick={handleChartClick}
            horizontal={true}
          />
        </div>
      </div>
    </div>
  );
}

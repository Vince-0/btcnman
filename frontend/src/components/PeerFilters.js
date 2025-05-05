'use client';

import { useState } from 'react';

export default function PeerFilters({ onFilterChange, onSortChange }) {
  const [connectionType, setConnectionType] = useState('all');
  const [version, setVersion] = useState('');
  const [services, setServices] = useState('');
  const [country, setCountry] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  
  const handleFilterApply = () => {
    const filters = {};
    
    if (connectionType !== 'all') {
      filters.connectionType = connectionType;
    }
    
    if (version) {
      filters.version = version;
    }
    
    if (services) {
      filters.services = services;
    }
    
    if (country) {
      filters.country = country;
    }
    
    onFilterChange(filters);
  };
  
  const handleSortApply = () => {
    if (sortBy) {
      onSortChange({ field: sortBy, order: sortOrder });
    }
  };
  
  const handleReset = () => {
    setConnectionType('all');
    setVersion('');
    setServices('');
    setCountry('');
    setSortBy('');
    setSortOrder('asc');
    
    onFilterChange({});
    onSortChange({});
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Filter & Sort</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {/* Connection Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Connection Type
          </label>
          <select
            value={connectionType}
            onChange={(e) => setConnectionType(e.target.value)}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All</option>
            <option value="inbound">Inbound</option>
            <option value="outbound">Outbound</option>
          </select>
        </div>
        
        {/* Version Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Version
          </label>
          <input
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="e.g. Satoshi:28.1.0"
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        {/* Services Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Services
          </label>
          <input
            type="text"
            value={services}
            onChange={(e) => setServices(e.target.value)}
            placeholder="e.g. NETWORK"
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        {/* Country Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="e.g. Germany or DE"
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">None</option>
            <option value="addr">Address</option>
            <option value="pingtime">Ping Time</option>
            <option value="bytessent">Bytes Sent</option>
            <option value="bytesrecv">Bytes Received</option>
            <option value="conntime">Connection Time</option>
            <option value="geolocation.country">Country</option>
          </select>
        </div>
        
        {/* Sort Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort Order
          </label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <button
          onClick={handleReset}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Reset
        </button>
        <button
          onClick={handleFilterApply}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Apply Filters
        </button>
        <button
          onClick={handleSortApply}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Apply Sort
        </button>
      </div>
    </div>
  );
}

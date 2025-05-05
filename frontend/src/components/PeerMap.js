'use client';

import { useEffect, useRef } from 'react';

export default function PeerMap({ peers }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // Initialize the map if it doesn't exist
    if (!mapInstanceRef.current && mapRef.current) {
      // Check if leaflet is available
      if (typeof window !== 'undefined' && window.L) {
        // Create map instance
        mapInstanceRef.current = window.L.map(mapRef.current).setView([20, 0], 2);
        
        // Add tile layer
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstanceRef.current);
      }
    }
    
    // Add markers for peers with geolocation data
    if (mapInstanceRef.current && peers && peers.length > 0) {
      // Clear existing markers
      markersRef.current.forEach(marker => {
        mapInstanceRef.current.removeLayer(marker);
      });
      markersRef.current = [];
      
      // Add new markers
      peers.forEach(peer => {
        if (peer.geolocation && peer.geolocation.lat && peer.geolocation.lon) {
          const marker = window.L.marker([peer.geolocation.lat, peer.geolocation.lon])
            .addTo(mapInstanceRef.current)
            .bindPopup(`
              <strong>${peer.addr}</strong><br>
              ${peer.geolocation.city}, ${peer.geolocation.country}<br>
              ${peer.outbound ? 'Outbound' : 'Inbound'}<br>
              ${peer.subver}
            `);
          markersRef.current.push(marker);
        }
      });
    }
    
    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [peers]);
  
  return (
    <div className="h-96 w-full rounded-lg overflow-hidden">
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}

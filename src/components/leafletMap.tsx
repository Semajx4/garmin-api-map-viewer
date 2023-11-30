//import axios from 'axios';
import React, { useRef, useEffect, useState } from 'react';
import L, { Map, LatLngExpression, Icon } from 'leaflet'; // Import Leaflet library and Map type
import markerIconPng from "../images/markerIcon.svg"


import 'leaflet/dist/leaflet.css'; // Import Leaflet's CSS

const MapComponent: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null); // Reference to the map container
  const mapInstance = useRef<Map | null>(null); // Reference to the map instance
  const [coordinates, setCoordinates] = useState<LatLngExpression>([51.505, -0.09]); // Default coordinates
  useEffect(() => {
    // Fetch coordinates from your API endpoint
    async function fetchCoordinates() {
      try {
        const response = await fetch('http://localhost:8080/api/v1/location'); // Replace with your API endpoint
        if (response.ok) {
          const data = await response.json();
          const firstPing =data.mapPings[0]

          // Assuming the data structure is [latitude, longitude]
          setCoordinates([firstPing.pingLatitiude,firstPing.pingLongitude]);
        } else {
          console.error('Failed to fetch coordinates');
        }
      } catch (error) {
        console.error('Error fetching coordinates:', error);
      }
    }

    fetchCoordinates();
  }, []);
  
  
  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      // Create a map instance if it doesn't exist
      mapInstance.current = L.map(mapRef.current).setView(coordinates, 13);

      // Add a tile layer to the map (using OpenStreetMap tiles)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapInstance.current);
      
    
      L.marker(coordinates, { icon: new Icon({iconUrl: markerIconPng, iconSize: [35, 41], iconAnchor: [12, 41]}) }).addTo(mapInstance.current);
        }

    return () => {
      // Clean up map instance on unmount
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [coordinates]);

  return (
    <div style={{ height: '400px' }}>
      {/* This div will contain the map */}
      <div ref={mapRef} style={{ height: '100%' }} />
    </div>
  );
};

export default MapComponent;

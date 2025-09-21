import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { Box } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import type { Tree } from '../api/client';

/// <reference types="@types/google.maps" />

interface MapComponentProps {
  trees: Tree[];
  apiKey: string;
  onTreeClick?: (tree: Tree) => void;
  onEmptyAreaClick?: (lat: number, lng: number) => void;
}

function Map({ trees, onTreeClick, onEmptyAreaClick }: {
  trees: Tree[];
  onTreeClick?: (tree: Tree) => void;
  onEmptyAreaClick?: (lat: number, lng: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center: { lat: 35.6762, lng: 139.6503 }, // Tokyo center as fallback
        zoom: 10,
      });

      if (onEmptyAreaClick) {
        newMap.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            onEmptyAreaClick(lat, lng);
          }
        });
      }

      setMap(newMap);
    }
  }, [ref, map, onEmptyAreaClick]);

  useEffect(() => {
    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    if (map) {
      const bounds = new window.google.maps.LatLngBounds();

      trees.forEach((tree) => {
        const marker = new window.google.maps.Marker({
          position: { lat: tree.lat, lng: tree.lng },
          map: map,
          title: `${tree.type} (ID: ${tree.id})`,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="green" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2L8 8h8l-4-6z"/>
                <path d="M12 8v12"/>
                <circle cx="12" cy="20" r="2" fill="brown"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(24, 24),
          }
        });

        markersRef.current.push(marker);
        bounds.extend(new window.google.maps.LatLng(tree.lat, tree.lng));

        // Add click listener for tree navigation
        marker.addListener('click', () => {
          if (onTreeClick) {
            onTreeClick(tree);
          } else {
            // Fallback to info window if no click handler
            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div>
                  <h3>${tree.type} (ID: ${tree.id})</h3>
                  <p>緯度: ${tree.lat}</p>
                  <p>経度: ${tree.lng}</p>
                  ${tree.lidar_url ? `<p>LiDAR: あり</p>` : `<p>LiDAR: なし</p>`}
                </div>
              `
            });
            infoWindow.open(map, marker);
          }
        });
      });

      if (trees.length > 0) {
        map.fitBounds(bounds);
      }
    }
  }, [map, trees, onTreeClick]);


  return <Box ref={ref} style={{ width: '100%', height: '100%' }} />;
}

export default function MapComponent({ trees, apiKey, onTreeClick, onEmptyAreaClick }: MapComponentProps) {
  const render = (status: Status): ReactElement => {
    if (status === Status.LOADING) return <Box>Loading map...</Box>;
    if (status === Status.FAILURE) return <Box>Error loading map</Box>;
    return <Box></Box>;
  };

  return (
    <Wrapper apiKey={apiKey} render={render}>
      <Map
        trees={trees}
        onTreeClick={onTreeClick}
        onEmptyAreaClick={onEmptyAreaClick}
      />
    </Wrapper>
  );
}
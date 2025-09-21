import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { ActionIcon, Box } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCurrentLocation } from '@tabler/icons-react';
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
  const [isGettingLocation, setIsGettingLocation] = useState(false);

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

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      notifications.show({
        title: 'エラー',
        message: 'お使いのブラウザは位置情報をサポートしていません',
        color: 'red',
      });
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        if (map) {
          map.setCenter({ lat: latitude, lng: longitude });
          map.setZoom(15);

          // Add current location marker
          new window.google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map: map,
            title: '現在地',
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="blue" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10" fill="lightblue" stroke="blue"/>
                  <circle cx="12" cy="12" r="3" fill="blue"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(24, 24),
            }
          });
        }

        setIsGettingLocation(false);
        notifications.show({
          title: '現在地を取得しました',
          message: 'マップを現在地に移動しました',
          color: 'blue',
        });
      },
      (error) => {
        setIsGettingLocation(false);
        console.error('位置情報の取得に失敗:', error);

        let message = '位置情報の取得に失敗しました';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = '位置情報の使用が拒否されました';
            break;
          case error.POSITION_UNAVAILABLE:
            message = '位置情報が利用できません';
            break;
          case error.TIMEOUT:
            message = '位置情報の取得がタイムアウトしました';
            break;
        }

        notifications.show({
          title: 'エラー',
          message,
          color: 'red',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  return (
    <Box style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Box ref={ref} style={{ width: '100%', height: '100%' }} />
      <ActionIcon
        onClick={getCurrentLocation}
        loading={isGettingLocation}
        variant="filled"
        color="blue"
        size="lg"
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          zIndex: 1000,
        }}
      >
        <IconCurrentLocation size={18} />
      </ActionIcon>
    </Box>
  );
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
import React, { useEffect, useMemo, useState } from 'react';
import { NativeModules, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import MapView, { Polyline, UrlTile } from 'react-native-maps';
import 'react-native-gesture-handler';
import { calculateETA } from './utils/eta';
import { getReconnectDelay } from './utils/reconnect';
import { useTransitWebSocket } from './hooks/useTransitWebSocket';
import AnimatedVehicleMarker from './components/AnimatedVehicleMarker';
import VehicleDetailSheet from './components/VehicleDetailSheet';

const getApiHost = () => {
  const scriptURL = NativeModules.SourceCode?.scriptURL;
  if (scriptURL) {
    const match = scriptURL.match(/^https?:\/\/([^:/]+)(:\d+)?/);
    if (match) {
      const ip = match[1];
      return `${ip}:3000`;
    }
  }
  return 'localhost:3000';
};

const API_HOST = getApiHost();
const HTTP_BASE_URL = `http://${API_HOST}`;
const WS_URL = `ws://${API_HOST}/ws`;

if (!globalThis.window) {
  globalThis.window = globalThis;
}

globalThis.window.calculateETA = calculateETA;
globalThis.window.getReconnectDelay = getReconnectDelay;

export default function App() {
  const [routes, setRoutes] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const { vehicles, connectionStatus } = useTransitWebSocket(WS_URL);

  useEffect(() => {
    fetch(`${HTTP_BASE_URL}/routes`)
      .then((response) => response.json())
      .then(setRoutes)
      .catch(() => setRoutes([]));
  }, []);

  const region = useMemo(
    () => ({
      latitude: 40.716,
      longitude: -74.003,
      latitudeDelta: 0.034,
      longitudeDelta: 0.034
    }),
    []
  );

  return (
    <SafeAreaView style={styles.root}>
      <MapView
        style={styles.map}
        initialRegion={region}
        data-testid="map-container"
        testID="map-container"
      >
        <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />
        {routes.map((route) => (
          <Polyline
            key={route.properties.route_id}
            coordinates={route.geometry.coordinates.map(([longitude, latitude]) => ({
              latitude,
              longitude
            }))}
            data-testid={`polyline-route-${route.properties.route_id}`}
            testID={`polyline-route-${route.properties.route_id}`}
            strokeColor={route.properties.color || '#e63946'}
            strokeWidth={4}
          />
        ))}
        {vehicles.map((vehicle) => (
          <AnimatedVehicleMarker
            key={vehicle.vehicle_id}
            vehicle={vehicle}
            onPress={setSelectedVehicle}
          />
        ))}
      </MapView>
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>{connectionStatus}</Text>
      </View>
      <VehicleDetailSheet vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1
  },
  root: {
    backgroundColor: '#f8f9fa',
    flex: 1
  },
  statusBar: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'absolute',
    top: 12
  },
  statusText: {
    color: '#1d3557',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase'
  }
});

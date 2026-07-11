import React, { memo, useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

function AnimatedVehicleMarker({ vehicle, onPress }) {
  const coordinate = useRef(
    new MapView.AnimatedRegion({
      latitude: vehicle.position[1],
      longitude: vehicle.position[0],
      latitudeDelta: 0,
      longitudeDelta: 0
    })
  ).current;

  useEffect(() => {
    coordinate
      .timing({
        latitude: vehicle.position[1],
        longitude: vehicle.position[0],
        duration: 2900,
        useNativeDriver: false
      })
      .start();
  }, [coordinate, vehicle.position]);

  return (
    <Marker.Animated
      coordinate={coordinate}
      data-testid={`vehicle-marker-${vehicle.vehicle_id}`}
      testID={`vehicle-marker-${vehicle.vehicle_id}`}
      onPress={() => onPress(vehicle)}
      tracksViewChanges={false}
    >
      <View style={styles.marker}>
        <Text style={styles.markerText}>{vehicle.route_id}</Text>
      </View>
    </Marker.Animated>
  );
}

const styles = StyleSheet.create({
  marker: {
    alignItems: 'center',
    backgroundColor: '#1d3557',
    borderColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    height: 32,
    justifyContent: 'center',
    width: 32
  },
  markerText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700'
  }
});

export default memo(AnimatedVehicleMarker);

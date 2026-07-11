import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function VehicleDetailSheet({ vehicle, onClose }) {
  if (!vehicle) {
    return null;
  }

  return (
    <View style={styles.sheet} data-testid="vehicle-detail-sheet" testID="vehicle-detail-sheet">
      <View style={styles.handle} />
      <Text style={styles.title}>Vehicle Details</Text>
      <Text data-testid="detail-vehicle-id" testID="detail-vehicle-id" style={styles.value}>
        {vehicle.vehicle_id}
      </Text>
      <Text data-testid="detail-speed" testID="detail-speed" style={styles.value}>
        {vehicle.speed} km/h
      </Text>
      <Text
        data-testid="detail-last-updated"
        testID="detail-last-updated"
        style={styles.value}
      >
        {vehicle.timestamp}
      </Text>
      <Pressable style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeText}>Close</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    alignItems: 'center',
    backgroundColor: '#1d3557',
    borderRadius: 6,
    marginTop: 14,
    paddingVertical: 10
  },
  closeText: {
    color: '#ffffff',
    fontWeight: '700'
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: '#adb5bd',
    borderRadius: 2,
    height: 4,
    marginBottom: 12,
    width: 42
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    bottom: 0,
    elevation: 8,
    left: 0,
    padding: 20,
    position: 'absolute',
    right: 0,
    shadowColor: '#000000',
    shadowOffset: { height: -3, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 8
  },
  title: {
    color: '#1d3557',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10
  },
  value: {
    color: '#212529',
    fontSize: 15,
    marginTop: 6
  }
});

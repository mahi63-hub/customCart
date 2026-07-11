const EARTH_RADIUS_KM = 6371;

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function haversineKm([lon1, lat1], [lon2, lat2]) {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function routeLengthKm(coordinates) {
  return coordinates.slice(1).reduce((total, point, index) => {
    return total + haversineKm(coordinates[index], point);
  }, 0);
}

function pointAlongRoute(coordinates, distanceKm) {
  if (coordinates.length === 0) return [0, 0];
  if (coordinates.length === 1) return coordinates[0];

  const totalKm = routeLengthKm(coordinates);
  const wrappedDistance = ((distanceKm % totalKm) + totalKm) % totalKm;
  let travelled = 0;

  for (let index = 1; index < coordinates.length; index += 1) {
    const start = coordinates[index - 1];
    const end = coordinates[index];
    const segmentKm = haversineKm(start, end);

    if (travelled + segmentKm >= wrappedDistance) {
      const ratio = segmentKm === 0 ? 0 : (wrappedDistance - travelled) / segmentKm;
      return [
        start[0] + (end[0] - start[0]) * ratio,
        start[1] + (end[1] - start[1]) * ratio
      ];
    }

    travelled += segmentKm;
  }

  return coordinates[coordinates.length - 1];
}

function createFleet(routes) {
  return routes.map((route, index) => ({
    id: `v${index + 1}`,
    routeId: route.properties.route_id,
    speed: index === 0 ? 34 : 28,
    distanceKm: index * 0.55
  }));
}

function advanceFleet({ vehicles, routesById, elapsedSeconds }) {
  return vehicles.map((vehicle) => {
    const route = routesById.get(vehicle.routeId);
    const coordinates = route.geometry.coordinates;
    const distanceDeltaKm = (vehicle.speed * elapsedSeconds) / 3600;
    vehicle.distanceKm += distanceDeltaKm;

    return {
      vehicle_id: vehicle.id,
      route_id: vehicle.routeId,
      position: pointAlongRoute(coordinates, vehicle.distanceKm),
      speed: vehicle.speed,
      timestamp: new Date().toISOString()
    };
  });
}

module.exports = {
  advanceFleet,
  createFleet,
  haversineKm,
  pointAlongRoute,
  routeLengthKm
};

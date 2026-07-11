const EARTH_RADIUS_KM = 6371;

function toRadians(value) {
  return (value * Math.PI) / 180;
}

export function haversineDistanceKm(currentPosition, nextStopPosition) {
  const dLat = toRadians(nextStopPosition.latitude - currentPosition.latitude);
  const dLon = toRadians(nextStopPosition.longitude - currentPosition.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(currentPosition.latitude)) *
      Math.cos(toRadians(nextStopPosition.latitude)) *
      Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calculateETA({ currentPosition, nextStopPosition, speedKmh }) {
  if (!speedKmh || speedKmh <= 0) {
    return Infinity;
  }

  const distanceKm = haversineDistanceKm(currentPosition, nextStopPosition);
  return (distanceKm / speedKmh) * 60;
}

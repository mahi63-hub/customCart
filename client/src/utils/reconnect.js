export function getReconnectDelay(attemptNumber) {
  return Math.min(30000, 1000 * 2 ** attemptNumber);
}

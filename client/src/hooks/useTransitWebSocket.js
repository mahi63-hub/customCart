import { useEffect, useRef, useState } from 'react';
import { getReconnectDelay } from '../utils/reconnect';

export function useTransitWebSocket(url) {
  const [vehicles, setVehicles] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const socketRef = useRef(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef(null);
  const shouldReconnectRef = useRef(true);

  useEffect(() => {
    shouldReconnectRef.current = true;

    const connect = () => {
      setConnectionStatus('connecting');
      socketRef.current = new WebSocket(url);

      socketRef.current.onopen = () => {
        reconnectAttemptRef.current = 0;
        setConnectionStatus('connected');
      };

      socketRef.current.onmessage = (event) => {
        setVehicles(JSON.parse(event.data));
      };

      socketRef.current.onerror = () => {
        setConnectionStatus('error');
      };

      socketRef.current.onclose = () => {
        if (!shouldReconnectRef.current) {
          return;
        }

        const delay = getReconnectDelay(reconnectAttemptRef.current);
        reconnectAttemptRef.current += 1;
        setConnectionStatus('reconnecting');
        reconnectTimerRef.current = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      shouldReconnectRef.current = false;
      clearTimeout(reconnectTimerRef.current);
      socketRef.current?.close();
    };
  }, [url]);

  return { vehicles, connectionStatus };
}

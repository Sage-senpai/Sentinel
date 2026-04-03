'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

type EventHandler = (data: unknown) => void;

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || '';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Don't connect if no WS URL configured
    if (!WS_URL) return;

    const socket = io(WS_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 30000,
      reconnectionAttempts: 5,
      autoConnect: true,
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const subscribe = useCallback((channel: string, handler: EventHandler) => {
    const socket = socketRef.current;
    if (!socket) return () => {};
    socket.on(channel, handler);
    return () => { socket.off(channel, handler); };
  }, []);

  const emit = useCallback((event: string, data: unknown) => {
    socketRef.current?.emit(event, data);
  }, []);

  return { connected, subscribe, emit };
}

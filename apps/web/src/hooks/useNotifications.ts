'use client';

import { useState, useCallback, useRef } from 'react';
import { playSound, type SoundType } from '@/services/sounds';

export type NotificationType = 'cascade' | 'whale' | 'guard' | 'alert' | 'success' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
}

let globalId = 0;

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const push = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    sound?: SoundType,
  ) => {
    const id = `notif-${++globalId}-${Date.now()}`;
    const notif: Notification = { id, type, title, message, timestamp: Date.now() };

    setNotifications((prev) => [notif, ...prev].slice(0, 20));

    if (sound) playSound(sound);

    // Auto-dismiss after 6 seconds
    const timeout = setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      timeoutsRef.current.delete(id);
    }, 6000);
    timeoutsRef.current.set(id, timeout);

    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    const t = timeoutsRef.current.get(id);
    if (t) { clearTimeout(t); timeoutsRef.current.delete(id); }
  }, []);

  const clear = useCallback(() => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current.clear();
    setNotifications([]);
  }, []);

  return { notifications, push, dismiss, clear };
}

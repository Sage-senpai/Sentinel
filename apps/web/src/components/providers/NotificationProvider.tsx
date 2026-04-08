'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useNotifications, type NotificationType } from '@/hooks/useNotifications';
import { NotificationToast } from '@/components/layout/NotificationToast/NotificationToast';
import type { SoundType } from '@/services/sounds';

interface NotificationCtx {
  push: (type: NotificationType, title: string, message: string, sound?: SoundType) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

const Ctx = createContext<NotificationCtx>({
  push: () => '',
  dismiss: () => {},
  clear: () => {},
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { notifications, push, dismiss, clear } = useNotifications();

  return (
    <Ctx.Provider value={{ push, dismiss, clear }}>
      {children}
      <NotificationToast notifications={notifications} onDismiss={dismiss} />
    </Ctx.Provider>
  );
}

export function useNotify() {
  return useContext(Ctx);
}

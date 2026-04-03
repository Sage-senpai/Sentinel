'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const API_CONFIGURED = !!process.env.NEXT_PUBLIC_API_URL;

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  options?: { pollInterval?: number; enabled?: boolean }
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  const failCountRef = useRef(0);
  fetcherRef.current = fetcher;

  const enabled = (options?.enabled ?? true) && API_CONFIGURED;

  const doFetch = useCallback(async () => {
    if (!enabled) { setLoading(false); return; }
    // Stop polling after 3 consecutive failures
    if (failCountRef.current >= 3) return;

    try {
      const result = await fetcherRef.current();
      setData(result);
      setError(null);
      failCountRef.current = 0;
    } catch (e) {
      failCountRef.current++;
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) { setLoading(false); return; }

    doFetch();

    if (options?.pollInterval) {
      const id = setInterval(doFetch, options.pollInterval);
      return () => clearInterval(id);
    }
  }, [doFetch, options?.pollInterval, enabled]);

  return { data, loading, error, refetch: doFetch };
}

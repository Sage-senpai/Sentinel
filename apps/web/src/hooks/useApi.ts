'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

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
  fetcherRef.current = fetcher;

  const enabled = options?.enabled ?? true;

  const doFetch = useCallback(async () => {
    if (!enabled) return;
    try {
      const result = await fetcherRef.current();
      setData(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    doFetch();

    if (options?.pollInterval && enabled) {
      const id = setInterval(doFetch, options.pollInterval);
      return () => clearInterval(id);
    }
  }, [doFetch, options?.pollInterval, enabled]);

  return { data, loading, error, refetch: doFetch };
}

import { useEffect, useState } from 'react';

interface RequestResult<T> {
  key: string;
  data?: T;
  error?: string;
  status?: number;
}

export const useApiData = <T>(url: string) => {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<RequestResult<T>>();
  const key = `${url}:${attempt}`;

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const response = await fetch(url, {
          signal: controller.signal,
        });

        if (!response.ok) {
          if (!controller.signal.aborted)
            setResult({
              key,
              status: response.status,
              error:
                response.status === 404
                  ? 'No electricity data found for this date.'
                  : response.status === 400
                    ? 'Check your filters. Ensure you are using valid dates and values.'
                    : 'We couldn’t load the statistics. Please try again.',
            });
          return;
        }

        const data: T = await response.json();
        if (!controller.signal.aborted) setResult({ key, data });
      } catch {
        if (!controller.signal.aborted) {
          setResult({
            key,
            error:
              'We couldn’t load the statistics. Check your connection and try again.',
          });
        }
      }
    };

    void load();
    return () => controller.abort();
  }, [url, key]);

  const current = result?.key === key ? result : undefined;

  return {
    data: current?.data,
    error: current?.error,
    status: current?.status,
    loading: !current,
    retry: () => setAttempt((value) => value + 1),
  };
};

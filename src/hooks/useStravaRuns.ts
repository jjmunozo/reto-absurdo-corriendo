
import useSWR from 'swr';
import { RunData } from '@/data/runningData';

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) {
    throw new Error(`HTTP ${r.status}: ${r.statusText}`);
  }
  return r.json();
});

export const useStravaRuns = () => {
  const { data, error, isLoading, mutate } = useSWR<RunData[]>('/api/strava', fetcher, {
    refreshInterval: 10 * 60 * 1000, // refresca cada 10 minutos
    revalidateOnFocus: false, // no revalidar al enfocar la ventana
    revalidateOnReconnect: true, // revalidar al reconectar internet
    dedupingInterval: 5 * 60 * 1000, // deduplicar requests por 5 minutos
  });

  return {
    runs: data ?? [],
    isLoading,
    isError: !!error,
    error: error,
    refresh: mutate, // función para refrescar manualmente
  };
};

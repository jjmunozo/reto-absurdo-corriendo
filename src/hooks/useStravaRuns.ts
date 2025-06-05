
import useSWR from 'swr';
import { RunData } from '@/data/runningData';
import { getStravaRuns } from '@/services/stravaApiService';

const fetcher = async (): Promise<RunData[]> => {
  console.log('🔄 SWR fetcher ejecutándose...');
  return await getStravaRuns();
};

export const useStravaRuns = () => {
  const { data, error, isLoading, mutate } = useSWR<RunData[]>('strava-runs', fetcher, {
    refreshInterval: 10 * 60 * 1000, // refresca cada 10 minutos
    revalidateOnFocus: false, // no revalidar al enfocar la ventana
    revalidateOnReconnect: true, // revalidar al reconectar internet
    dedupingInterval: 5 * 60 * 1000, // deduplicar requests por 5 minutos
    onError: (error) => {
      console.error('❌ Error en SWR:', error);
    },
    onSuccess: (data) => {
      console.log('✅ SWR success:', data?.length, 'carreras cargadas');
    }
  });

  return {
    runs: data ?? [],
    isLoading,
    isError: !!error,
    error: error,
    refresh: mutate, // función para refrescar manualmente
  };
};

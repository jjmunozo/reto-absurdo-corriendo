
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type ManualRun = Database['public']['Tables']['manual_runs']['Row'];

export interface RunData {
  id: string;
  name: string;
  start_date_local: string;
  distance: number; // en metros
  moving_time: number; // en segundos
  total_elevation_gain: number;
  has_pr?: boolean;
}

export const useManualRunData = () => {
  const [activities, setActivities] = useState<RunData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const loadActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('manual_runs')
        .select('*')
        .order('start_time', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Convertir datos manuales al formato RunData
      const convertedData: RunData[] = (data || []).map((run: ManualRun) => ({
        id: run.id,
        name: run.title,
        start_date_local: run.start_time,
        distance: run.distance_km * 1000, // convertir km a metros
        moving_time: run.duration_minutes * 60, // convertir minutos a segundos
        total_elevation_gain: run.total_elevation,
        has_pr: run.has_pr
      }));

      setActivities(convertedData);
      setLastSync(new Date());
    } catch (err: any) {
      console.error('Error loading manual runs:', err);
      setError(err.message || 'Error al cargar las carreras manuales');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  return {
    activities,
    isLoading,
    isSyncing: false,
    lastSync,
    error,
    syncActivities: loadActivities
  };
};

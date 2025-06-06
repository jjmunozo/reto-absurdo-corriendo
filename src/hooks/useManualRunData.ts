
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { RunData } from '@/data/runningData';

type ManualRun = Database['public']['Tables']['manual_runs']['Row'];

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

      // Convertir datos manuales al formato RunData original con campos extendidos
      const convertedData: RunData[] = (data || []).map((run: ManualRun) => ({
        id: parseInt(run.id.replace(/-/g, '').substring(0, 10), 16), // Convertir UUID a número
        date: run.start_time.split('T')[0], // Extraer solo la fecha
        distance: run.distance_km, // Ya está en km
        duration: run.duration_minutes, // Ya está en minutos
        elevation: run.total_elevation, // Ya está en metros
        avgPace: run.avg_pace, // Ya está en min/km
        location: run.title, // Usar el título como ubicación
        startTimeLocal: run.start_time, // Mantener el timestamp completo
        hasPR: run.has_pr || false,
        prType: run.pr_type,
        prDescription: run.pr_description
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

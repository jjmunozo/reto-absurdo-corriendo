
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
      const convertedData: RunData[] = (data || []).map((run: ManualRun) => {
        // Convertir las horas, minutos y segundos a minutos totales para mantener compatibilidad
        const totalMinutes = (run.duration_hours || 0) * 60 + (run.duration_minutes || 0) + (run.duration_seconds || 0) / 60;
        
        // Para datos manuales, usar la fecha tal como se ingresó sin conversiones de zona horaria
        const startDateTime = new Date(run.start_time);
        
        // Extraer solo la fecha en formato YYYY-MM-DD usando la fecha local sin conversiones
        const year = startDateTime.getFullYear();
        const month = String(startDateTime.getMonth() + 1).padStart(2, '0');
        const day = String(startDateTime.getDate()).padStart(2, '0');
        const localDateString = `${year}-${month}-${day}`;
        
        console.log('📅 Procesando fecha manual (sin conversión):', {
          originalTimestamp: run.start_time,
          extractedDate: localDateString,
          originalDateTime: startDateTime.toISOString()
        });
        
        return {
          id: parseInt(run.id.replace(/-/g, '').substring(0, 10), 16), // Convertir UUID a número
          date: localDateString, // Usar la fecha local sin conversiones
          distance: run.distance_km, // Ya está en km
          duration: Math.round(totalMinutes), // Convertir a entero para compatibilidad
          elevation: run.total_elevation, // Ya está en metros
          avgPace: run.avg_pace, // Ya está en min/km
          location: run.title, // Usar el título como ubicación
          startTimeLocal: run.start_time, // Mantener el timestamp completo para mostrar la hora
          hasPR: run.has_pr || false,
          prType: run.pr_type,
          prDescription: run.pr_description
        };
      });

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

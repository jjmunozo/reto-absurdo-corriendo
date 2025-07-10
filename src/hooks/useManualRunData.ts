
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

      console.log('📊 Cargando carreras manuales...');

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
        
        console.log('📊 Procesando carrera SIN conversiones de zona horaria:', {
          id: run.id,
          title: run.title,
          startTime: run.start_time
        });
        
        // Usar la fecha tal como está guardada - SIN conversiones de zona horaria
        const startDateTime = run.start_time;
        
        // Extraer solo la fecha (YYYY-MM-DD) del timestamp directamente
        const dateOnly = startDateTime.substring(0, 10);
        
        return {
          id: parseInt(run.id.replace(/-/g, '').substring(0, 10), 16), // Convertir UUID a número
          date: dateOnly, // Solo la fecha YYYY-MM-DD extraída directamente
          distance: run.distance_km, // Ya está en km
          duration: Math.round(totalMinutes), // Convertir a entero para compatibilidad
          elevation: run.total_elevation, // Ya está en metros
          avgPace: run.avg_pace, // Ya está en min/km
          location: run.title, // Usar el título como ubicación
          startTimeLocal: startDateTime, // Mantener el timestamp completo tal como está
          hasPR: run.has_pr || false,
          prType: run.pr_type,
          prDescription: run.pr_description
        };
      });

      console.log('✅ Carreras procesadas SIN conversiones:', convertedData.length);

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

  const updateManualRun = async (id: string | number, updates: Partial<ManualRun>) => {
    try {
      console.log('📝 Actualizando carrera:', { id, updates });

      const { error } = await supabase
        .from('manual_runs')
        .update(updates)
        .eq('id', id.toString());

      if (error) {
        throw error;
      }

      console.log('✅ Carrera actualizada exitosamente');
    } catch (err: any) {
      console.error('Error updating manual run:', err);
      throw err;
    }
  };

  const deleteManualRun = async (id: string | number) => {
    try {
      console.log('🗑️ Eliminando carrera:', { id });

      const { error } = await supabase
        .from('manual_runs')
        .delete()
        .eq('id', id.toString());

      if (error) {
        throw error;
      }

      console.log('✅ Carrera eliminada exitosamente');
    } catch (err: any) {
      console.error('Error deleting manual run:', err);
      throw err;
    }
  };

  return {
    activities,
    isLoading,
    isSyncing: false,
    lastSync,
    error,
    syncActivities: loadActivities,
    updateManualRun,
    deleteManualRun
  };
};

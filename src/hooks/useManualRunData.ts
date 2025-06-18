
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

  // Función para corregir fechas incorrectas existentes
  const fixExistingRunDates = async () => {
    try {
      console.log('🔧 Iniciando corrección de fechas existentes...');
      
      // Obtener todas las carreras
      const { data: runs, error: fetchError } = await supabase
        .from('manual_runs')
        .select('*');

      if (fetchError) {
        console.error('Error fetching runs for date fix:', fetchError);
        return;
      }

      if (!runs || runs.length === 0) {
        console.log('No hay carreras para corregir');
        return;
      }

      // Procesar cada carrera
      for (const run of runs) {
        const originalDate = new Date(run.start_time);
        
        // Si la fecha parece ser UTC (termina en Z o +00:00), la corregimos
        const dateString = run.start_time;
        if (dateString.includes('Z') || dateString.includes('+00:00')) {
          console.log('🔧 CORRIGIENDO FECHA:', {
            id: run.id,
            fechaOriginal: dateString,
            fechaParseada: originalDate.toISOString()
          });
          
          // Crear la nueva fecha agregando un día para compensar la diferencia de zona horaria
          const correctedDate = new Date(originalDate);
          correctedDate.setDate(correctedDate.getDate() + 1);
          
          // Convertir a string en formato local (sin zona horaria)
          const year = correctedDate.getFullYear();
          const month = String(correctedDate.getMonth() + 1).padStart(2, '0');
          const day = String(correctedDate.getDate()).padStart(2, '0');
          const hours = String(correctedDate.getHours()).padStart(2, '0');
          const minutes = String(correctedDate.getMinutes()).padStart(2, '0');
          const seconds = String(correctedDate.getSeconds()).padStart(2, '0');
          
          const newDateString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
          
          console.log('📅 FECHA CORREGIDA:', {
            fechaAnterior: dateString,
            fechaNueva: newDateString
          });
          
          // Actualizar en la base de datos
          const { error: updateError } = await supabase
            .from('manual_runs')
            .update({ start_time: newDateString })
            .eq('id', run.id);
            
          if (updateError) {
            console.error('Error updating run date:', updateError);
          } else {
            console.log('✅ Fecha actualizada correctamente para:', run.title);
          }
        } else {
          console.log('🟢 Fecha ya está en formato correcto:', run.title, dateString);
        }
      }
      
      console.log('✅ Corrección de fechas completada');
    } catch (error) {
      console.error('Error en corrección de fechas:', error);
    }
  };

  const loadActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Primero ejecutar la corrección de fechas
      await fixExistingRunDates();

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
        
        console.log('🔧 LEYENDO CARRERA - Datos de la base:', {
          id: run.id,
          originalTimestamp: run.start_time,
          title: run.title
        });
        
        // Para datos manuales, usar la fecha como está guardada (ahora corregida)
        const startDateTime = new Date(run.start_time);
        
        // Extraer la fecha usando métodos locales
        const year = startDateTime.getFullYear();
        const month = String(startDateTime.getMonth() + 1).padStart(2, '0');
        const day = String(startDateTime.getDate()).padStart(2, '0');
        const localDateString = `${year}-${month}-${day}`;
        
        console.log('📅 FECHA PROCESADA:', {
          originalTimestamp: run.start_time,
          fechaExtraida: localDateString,
          año: year,
          mes: month,
          día: day
        });
        
        return {
          id: parseInt(run.id.replace(/-/g, '').substring(0, 10), 16), // Convertir UUID a número
          date: localDateString, // La fecha local extraída correctamente
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

      console.log('✅ CARRERAS CONVERTIDAS:', convertedData.length, 'carreras procesadas');
      console.log('📊 Primeras 3 carreras:', convertedData.slice(0, 3).map(r => ({
        fecha: r.date,
        titulo: r.location,
        horaCompleta: r.startTimeLocal
      })));

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

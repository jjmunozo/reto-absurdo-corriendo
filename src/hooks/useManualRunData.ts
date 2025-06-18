
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

  // Función para corregir las horas incorrectas causadas por la corrección anterior
  const fixIncorrectHours = async () => {
    try {
      console.log('🔧 Iniciando corrección de horas incorrectas...');
      
      // Obtener todas las carreras
      const { data: runs, error: fetchError } = await supabase
        .from('manual_runs')
        .select('*');

      if (fetchError) {
        console.error('Error fetching runs for hour fix:', fetchError);
        return;
      }

      if (!runs || runs.length === 0) {
        console.log('No hay carreras para corregir horas');
        return;
      }

      // Procesar cada carrera para corregir las horas
      for (const run of runs) {
        const currentDate = new Date(run.start_time);
        const currentHour = currentDate.getHours();
        
        console.log('🔧 VERIFICANDO HORA:', {
          id: run.id,
          title: run.title,
          fechaActual: run.start_time,
          horaActual: currentHour
        });
        
        // Detectar si las horas están incorrectas y necesitan corrección
        // Si la hora está entre 18-23 (6 PM - 11 PM), probablemente era una carrera matutina (6 AM - 11 AM)
        // Si la hora está entre 0-5 (12 AM - 5 AM), probablemente era una carrera matutina (6 AM - 11 AM)
        let needsCorrection = false;
        let hoursToSubtract = 0;
        
        if (currentHour >= 18 && currentHour <= 23) {
          // Carreras que ahora muestran 18-23 (6-11 PM) probablemente eran 6-11 AM
          needsCorrection = true;
          hoursToSubtract = 18; // Para convertir 18-23 a 0-5, luego ajustar a 6-11
        } else if (currentHour >= 0 && currentHour <= 5) {
          // Carreras que ahora muestran 0-5 (12-5 AM) probablemente eran 6-11 AM  
          needsCorrection = true;
          hoursToSubtract = -6; // Agregar 6 horas para convertir 0-5 a 6-11
        }
        
        if (needsCorrection) {
          console.log('🔧 CORRIGIENDO HORA:', {
            title: run.title,
            horaAnterior: currentHour,
            ajuste: hoursToSubtract
          });
          
          const correctedDate = new Date(currentDate);
          correctedDate.setHours(correctedDate.getHours() - hoursToSubtract);
          
          // Convertir a string en formato local manteniendo la fecha correcta
          const year = correctedDate.getFullYear();
          const month = String(correctedDate.getMonth() + 1).padStart(2, '0');
          const day = String(correctedDate.getDate()).padStart(2, '0');
          const hours = String(correctedDate.getHours()).padStart(2, '0');
          const minutes = String(correctedDate.getMinutes()).padStart(2, '0');
          const seconds = String(correctedDate.getSeconds()).padStart(2, '0');
          
          const newDateTimeString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
          
          console.log('🕐 HORA CORREGIDA:', {
            fechaAnterior: run.start_time,
            fechaNueva: newDateTimeString,
            horaAnterior: currentHour,
            horaNueva: correctedDate.getHours()
          });
          
          // Actualizar en la base de datos
          const { error: updateError } = await supabase
            .from('manual_runs')
            .update({ start_time: newDateTimeString })
            .eq('id', run.id);
            
          if (updateError) {
            console.error('Error updating run hour:', updateError);
          } else {
            console.log('✅ Hora actualizada correctamente para:', run.title);
          }
        } else {
          console.log('🟢 Hora ya está correcta:', run.title, 'Hora:', currentHour);
        }
      }
      
      console.log('✅ Corrección de horas completada');
    } catch (error) {
      console.error('Error en corrección de horas:', error);
    }
  };

  const loadActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Ejecutar la corrección de horas incorrectas
      await fixIncorrectHours();

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

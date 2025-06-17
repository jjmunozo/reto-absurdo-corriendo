
import { RunData } from '@/data/runningData';
import { toZonedTime } from 'date-fns-tz';

export interface WeeklyDistanceData {
  week: string;
  distance: number;
  runs: number;
}

const COSTA_RICA_TIMEZONE = 'America/Costa_Rica';

export const calculateWeeklyDistanceStats = (runData: RunData[]): WeeklyDistanceData[] => {
  console.log('📊 calculateWeeklyDistanceStats: Procesando', runData.length, 'carreras');
  
  // Filtrar datos inválidos antes de procesarlos
  const validRuns = runData.filter(run => {
    const isValid = run.date && run.distance && !isNaN(new Date(run.date).getTime());
    if (!isValid) {
      console.warn('⚠️ Registro inválido filtrado:', run);
    }
    return isValid;
  });
  
  console.log('📊 Carreras válidas después del filtrado:', validRuns.length);
  
  // Objeto para almacenar estadísticas por semana con metadatos adicionales
  const weekStats: Record<string, { 
    totalDistance: number, 
    runsCount: number,
    mondayDate: Date,
    year: number
  }> = {};
  
  // Calcular estadísticas para cada carrera
  validRuns.forEach(run => {
    // Para fechas que vienen como string YYYY-MM-DD, las tratamos como locales
    // Para fechas que vienen como timestamp, las convertimos a zona horaria local
    let date: Date;
    
    if (run.date.includes('T')) {
      // Es un timestamp completo, convertir a zona horaria de Costa Rica
      const utcDate = new Date(run.date);
      date = toZonedTime(utcDate, COSTA_RICA_TIMEZONE);
    } else {
      // Es solo una fecha, la tratamos como ya está en zona horaria local
      date = new Date(run.date + 'T00:00:00');
    }
    
    if (isNaN(date.getTime())) {
      console.warn('⚠️ Fecha inválida en carrera:', run);
      return;
    }
    
    console.log('📅 Procesando fecha:', {
      originalDate: run.date,
      processedDate: date.toISOString(),
      isTimestamp: run.date.includes('T')
    });
    
    // Calcular el inicio de la semana (lunes)
    const dayOfWeek = date.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Si es domingo (0), retroceder 6 días
    const mondayDate = new Date(date);
    mondayDate.setDate(date.getDate() - daysToMonday);
    
    // Crear clave de semana en formato "YYYY-MM-DD" (fecha del lunes)
    const weekKey = mondayDate.toISOString().split('T')[0];
    
    // Inicializar si no existe
    if (!weekStats[weekKey]) {
      weekStats[weekKey] = {
        totalDistance: 0,
        runsCount: 0,
        mondayDate: new Date(mondayDate),
        year: mondayDate.getFullYear()
      };
    }
    
    // Acumular datos
    weekStats[weekKey].totalDistance += run.distance;
    weekStats[weekKey].runsCount += 1;
    
    console.log('📊 Procesando carrera:', {
      originalDate: run.date,
      mondayDate: weekKey,
      distance: run.distance
    });
  });
  
  // Convertir a array y ordenar correctamente
  const weeklyData = Object.entries(weekStats)
    .map(([weekKey, stats]) => {
      const mondayDate = stats.mondayDate;
      
      // Determinar si necesitamos mostrar el año (cuando hay cambio de año)
      const currentYear = new Date().getFullYear();
      const weekYear = stats.year;
      const needsYear = weekYear !== currentYear;
      
      // Formato de semana más legible
      const weekLabel = needsYear 
        ? `${mondayDate.getDate().toString().padStart(2, '0')}/${(mondayDate.getMonth() + 1).toString().padStart(2, '0')}/${weekYear}`
        : `${mondayDate.getDate().toString().padStart(2, '0')}/${(mondayDate.getMonth() + 1).toString().padStart(2, '0')}`;
      
      return {
        week: weekLabel,
        distance: Number(stats.totalDistance.toFixed(1)),
        runs: stats.runsCount,
        _sortKey: weekKey // Clave interna para ordenamiento
      };
    })
    .sort((a, b) => {
      // Ordenar usando la fecha original (weekKey) en lugar de la etiqueta formateada
      return new Date(a._sortKey).getTime() - new Date(b._sortKey).getTime();
    })
    .map(({ _sortKey, ...item }) => item); // Remover la clave interna de ordenamiento
  
  console.log('📊 Datos semanales de distancia (primeras 5 semanas):', weeklyData.slice(0, 5));
  console.log('📊 Datos semanales de distancia (últimas 5 semanas):', weeklyData.slice(-5));
  console.log('📊 Total de semanas procesadas:', weeklyData.length);
  
  // Validación final: verificar que no hay registros con fechas imposibles
  const validatedData = weeklyData.filter(week => {
    const isValidWeek = week.distance > 0 && week.runs > 0;
    if (!isValidWeek) {
      console.warn('⚠️ Semana con datos inválidos filtrada:', week);
    }
    return isValidWeek;
  });
  
  return validatedData;
};

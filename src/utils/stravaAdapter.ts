
import { RunData, MonthlyStats } from '@/data/runningData';
import { getRunningData, getAthleteInfo, getAthleteStats, isAuthenticated } from '@/services/stravaService';
import { loadRunningDataFromJson, isAdminMode } from '@/services/dataExportService';
import { toZonedTime, zonedTimeToUtc, format } from 'date-fns-tz';

/**
 * Obtiene datos de carrera desde Strava y los convierte al formato de la aplicación
 */
export const fetchStravaRunningData = async (): Promise<RunData[]> => {
  try {
    // Si no estamos en modo admin, intentar cargar datos del JSON
    if (!isAdminMode()) {
      const cachedData = loadRunningDataFromJson();
      if (cachedData && cachedData.length > 0) {
        return cachedData;
      }
    }
    
    // Si estamos en modo admin o no hay datos en caché, intentar obtener desde Strava
    if (isAuthenticated()) {
      const runData = await getRunningData();
      
      // Ordenar por fecha (más reciente primero)
      return runData.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    }
    
    return [];
  } catch (error) {
    console.error('Error obteniendo datos de Strava:', error);
    return [];
  }
};

/**
 * Calcula estadísticas mensuales a partir de los datos de carrera
 */
export const calculateMonthlyStats = (runData: RunData[]): MonthlyStats[] => {
  // Objeto para almacenar estadísticas por mes
  const monthStats: Record<string, MonthlyStats> = {};
  
  // Nombres de los meses en español
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  // Inicializar estadísticas para todos los meses del año actual
  const currentYear = new Date().getFullYear();
  for (let i = 0; i < 12; i++) {
    monthStats[`${currentYear}-${(i + 1).toString().padStart(2, '0')}`] = {
      month: monthNames[i],
      distance: 0,
      runs: 0,
      time: 0
    };
  }
  
  // Calcular estadísticas para cada carrera
  runData.forEach(run => {
    const date = new Date(run.date);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    
    // Asegurarse de que exista el mes en el objeto (por si hay datos de años anteriores)
    if (!monthStats[monthKey]) {
      // Si estamos en un año anterior, crear la entrada para ese mes
      const monthIndex = date.getMonth();
      monthStats[monthKey] = {
        month: monthNames[monthIndex],
        distance: 0,
        runs: 0,
        time: 0
      };
    }
    
    // Actualizar estadísticas para el mes
    monthStats[monthKey].distance += run.distance;
    monthStats[monthKey].runs += 1;
    monthStats[monthKey].time += run.duration;
  });
  
  // Convertir objeto a array y ordenar por mes (de más reciente a más antiguo)
  return Object.entries(monthStats)
    .map(([key, value]) => value)
    .sort((a, b) => {
      const monthOrder: Record<string, number> = {};
      monthNames.forEach((month, index) => {
        monthOrder[month] = index;
      });
      return monthOrder[a.month] - monthOrder[b.month];
    });
};

/**
 * Calcula estadísticas totales a partir de los datos de carrera
 */
export const calculateTotalStats = (runData: RunData[]) => {
  if (runData.length === 0) {
    return {
      totalDistance: 0,
      totalRuns: 0,
      totalTime: 0,
      totalElevation: 0,
      avgPace: 0,
      longestRun: 0,
    };
  }
  
  return {
    totalDistance: runData.reduce((sum, run) => sum + run.distance, 0),
    totalRuns: runData.length,
    totalTime: runData.reduce((sum, run) => sum + run.duration, 0),
    totalElevation: runData.reduce((sum, run) => sum + run.elevation, 0),
    avgPace: runData.length > 0 ? runData.reduce((sum, run) => sum + run.avgPace, 0) / runData.length : 0,
    longestRun: Math.max(...(runData.length > 0 ? runData.map(run => run.distance) : [0])),
  };
};

/**
 * Prepara los datos para el heatmap
 */
export const generateHeatmapData = (runData: RunData[]) => {
  // Obtenemos los últimos 365 días para mostrar un año completo
  const today = new Date();
  const heatmapData = [];
  
  for (let i = 365; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    // Buscar si hay una carrera en esa fecha
    const run = runData.find(r => r.date === dateString);
    
    heatmapData.push({
      date: dateString,
      value: run ? run.distance : 0
    });
  }
  
  return heatmapData;
};

/**
 * Prepara los datos para los gráficos
 */
export const prepareChartData = (monthlyStats: MonthlyStats[]) => {
  // Ordenar los datos por mes (de enero a diciembre)
  return [...monthlyStats];
};

/**
 * Calcula la cantidad de carreras por hora del día, utilizando la zona horaria de Costa Rica
 * @param runData Datos de carrera
 * @returns Array con la cantidad de carreras por hora
 */
export const calculateRunsPerHour = (runData: RunData[]): { hour: string, runs: number }[] => {
  // Inicializar array con todas las horas (0-23)
  const hoursData = Array.from({ length: 24 }).map((_, index) => ({
    hour: index.toString().padStart(2, '0') + ':00',
    runs: 0
  }));
  
  // La zona horaria de Costa Rica es UTC-6
  const timeZone = 'America/Costa_Rica';
  
  // Contar carreras por hora
  runData.forEach(run => {
    try {
      // Si tenemos el campo startTimeLocal (fecha-hora completa)
      if (run.startTimeLocal) {
        // Convertir la fecha a la zona horaria de Costa Rica
        const dateObj = new Date(run.startTimeLocal);
        const crDateObj = toZonedTime(dateObj, timeZone);
        const hourOfDay = crDateObj.getHours();
        
        // Debug para ver las fechas transformadas
        console.log(`Run: ${run.date}, Start Time: ${run.startTimeLocal}, CR Time: ${format(crDateObj, 'yyyy-MM-dd HH:mm:ss', { timeZone })}, Hour: ${hourOfDay}`);
        
        // Incrementar contador para esa hora
        if (hourOfDay >= 0 && hourOfDay < 24) {
          hoursData[hourOfDay].runs += 1;
        }
      } else {
        // Compatibilidad con datos antiguos que no tienen startTimeLocal
        console.warn(`Run sin startTimeLocal: ${run.date}`);
      }
    } catch (error) {
      console.error(`Error procesando hora para carrera ${run.date}:`, error);
    }
  });
  
  return hoursData;
};

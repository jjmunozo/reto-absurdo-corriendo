
import { RunData, MonthlyStats } from '@/data/runningData';
import { getRunningData } from '@/services/stravaService';

/**
 * Obtiene datos de carrera desde Strava y los convierte al formato de la aplicación
 */
export const fetchStravaRunningData = async (): Promise<RunData[]> => {
  try {
    const runData = await getRunningData();
    return runData;
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
    
    if (monthStats[monthKey]) {
      monthStats[monthKey].distance += run.distance;
      monthStats[monthKey].runs += 1;
      monthStats[monthKey].time += run.duration;
    }
  });
  
  // Convertir objeto a array y ordenar por mes (de más reciente a más antiguo)
  return Object.values(monthStats).reverse();
};

/**
 * Calcula estadísticas totales a partir de los datos de carrera
 */
export const calculateTotalStats = (runData: RunData[]) => {
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
  // Obtenemos los últimos 90 días
  const today = new Date();
  const heatmapData = [];
  
  for (let i = 90; i >= 0; i--) {
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
  return monthlyStats;
};

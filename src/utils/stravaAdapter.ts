import { RunData, MonthlyStats } from '@/data/runningData';
import { toZonedTime, format } from 'date-fns-tz';

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
 * con manejo adecuado de la zona horaria y DST
 * @param runData Datos de carrera
 * @returns Array con la cantidad de carreras por hora
 */
export const calculateRunsPerHour = (runData: RunData[]): { hour: string, runs: number }[] => {
  console.log('⏰ calculateRunsPerHour: Procesando', runData.length, 'carreras');
  
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
        const dateObj = new Date(run.startTimeLocal);
        const crDateObj = toZonedTime(dateObj, timeZone);
        const hourOfDay = crDateObj.getHours();
        
        // Debug para ver las fechas transformadas
        console.log(`⏰ Run hora: ${run.date}, Start Time: ${run.startTimeLocal}, CR Time: ${format(crDateObj, 'yyyy-MM-dd HH:mm:ss', { timeZone })}, Hour: ${hourOfDay}`);
        
        // Incrementar contador para esa hora
        if (hourOfDay >= 0 && hourOfDay < 24) {
          hoursData[hourOfDay].runs += 1;
        }
      } else {
        console.warn(`⏰ Run sin startTimeLocal: ${run.date}`);
      }
    } catch (error) {
      console.error(`⏰ Error procesando hora para carrera ${run.date}:`, error);
    }
  });
  
  console.log('⏰ Resultado final por horas:', hoursData.filter(h => h.runs > 0));
  return hoursData;
};

/**
 * Calcula el ritmo promedio por semana
 */
export const calculateWeeklyPaceStats = (runData: RunData[]): { week: string, avgPace: number }[] => {
  console.log('📊 calculateWeeklyPaceStats: Procesando', runData.length, 'carreras');
  
  // Objeto para almacenar estadísticas por semana
  const weekStats: Record<string, { totalPace: number, runsCount: number }> = {};
  
  // Calcular estadísticas para cada carrera
  runData.forEach(run => {
    const date = new Date(run.date);
    
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
        totalPace: 0,
        runsCount: 0
      };
    }
    
    // Acumular datos
    weekStats[weekKey].totalPace += run.avgPace;
    weekStats[weekKey].runsCount += 1;
  });
  
  // Convertir a array y calcular promedios
  const weeklyData = Object.entries(weekStats)
    .map(([weekKey, stats]) => {
      const avgPace = stats.runsCount > 0 ? stats.totalPace / stats.runsCount : 0;
      const weekDate = new Date(weekKey);
      
      // Formato de semana más legible
      const weekLabel = `${weekDate.getDate().toString().padStart(2, '0')}/${(weekDate.getMonth() + 1).toString().padStart(2, '0')}`;
      
      return {
        week: weekLabel,
        avgPace: Number(avgPace.toFixed(2))
      };
    })
    .sort((a, b) => {
      // Ordenar por fecha (convertir de vuelta para comparar)
      const dateA = new Date(a.week.split('/').reverse().join('-'));
      const dateB = new Date(b.week.split('/').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });
  
  console.log('📊 Datos semanales de ritmo:', weeklyData.slice(0, 5)); // Log primeras 5 semanas
  return weeklyData;
};

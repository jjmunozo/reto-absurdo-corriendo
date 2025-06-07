
import { RunData } from '@/data/runningData';

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
  
  console.log('📊 Datos semanales de pace:', weeklyData.slice(0, 5)); // Log primeras 5 semanas
  return weeklyData;
};


import { RunData, MonthlyStats } from '@/data/runningData';

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

export const prepareChartData = (monthlyStats: MonthlyStats[]) => {
  // Ordenar los datos por mes (de enero a diciembre)
  return [...monthlyStats];
};

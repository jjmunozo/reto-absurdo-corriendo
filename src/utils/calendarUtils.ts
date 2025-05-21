
// Helper functions for calendar components

/**
 * Gets a month name in Spanish
 * @param monthIndex - The index of the month (0-11)
 * @returns Month name in Spanish
 */
export const getMonthName = (monthIndex: number): string => {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return months[monthIndex];
};

/**
 * Calculates the color class based on distance
 * @param distance - Distance in kilometers
 * @returns Tailwind CSS class for background color
 */
export const getDistanceColorClass = (distance: number): string => {
  if (!distance) return '';
  
  // Distance ranges with colors
  if (distance >= 50) {
    return 'bg-orange-500'; // 50km+ naranja intenso
  } else if (distance >= 42) {
    return 'bg-running-secondary'; // 42-50km verde intenso
  } else if (distance >= 30) {
    return 'bg-running-secondary opacity-70'; // 30-42km verde
  } else if (distance >= 20) {
    return 'bg-running-primary'; // 20-30km azul intenso
  } else if (distance >= 15) {
    return 'bg-running-primary opacity-80'; // 15-20km azul estándar
  } else if (distance >= 10) {
    return 'bg-running-primary opacity-60'; // 10-15km azul medio
  } else {
    return 'bg-running-light opacity-50'; // <10km azul claro
  }
};

/**
 * Creates a map of dates to distances
 * @param runningData - Array of run data
 * @param year - Year to filter by
 * @returns Record of dates to distances
 */
export const createRunDatesMap = (
  runningData: Array<{date: string; distance: number}>, 
  year: number
): Record<string, number> => {
  return runningData.reduce((dates: Record<string, number>, run) => {
    // Solo considerar fechas del año seleccionado
    if (new Date(run.date).getFullYear() === year) {
      dates[run.date] = run.distance;
    }
    return dates;
  }, {});
};

/**
 * Calculates monthly statistics based on run dates
 * @param runDates - Record of dates to distances
 * @param year - Year to filter by
 * @returns Object with monthly stats
 */
export const calculateMonthlyStats = (
  runDates: Record<string, number>, 
  year: number
): { [month: number]: { days: number; distance: number } } => {
  const stats: { [month: number]: { days: number; distance: number } } = {};
  
  // Initialize all months
  for (let i = 0; i < 12; i++) {
    stats[i] = { days: 0, distance: 0 };
  }
  
  // Count days and distance by month
  Object.entries(runDates).forEach(([dateStr, distance]) => {
    const date = new Date(dateStr);
    if (date.getFullYear() === year) {
      const month = date.getMonth();
      stats[month].days += 1;
      stats[month].distance += distance;
    }
  });
  
  return stats;
};

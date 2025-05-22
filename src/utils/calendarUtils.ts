
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
 * Ensures consistent date string format (YYYY-MM-DD)
 * @param date - Date object or string
 * @returns Formatted date string
 */
export const formatDateString = (date: Date | string): string => {
  if (typeof date === 'string') {
    // If already a string, ensure it's in the correct format
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date; // Already in YYYY-MM-DD format
    }
    
    // Parse the string into a Date object
    date = new Date(date);
  }
  
  // Format to YYYY-MM-DD
  return date.toISOString().split('T')[0];
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
  // Create a proper date-indexed object with runs
  const runDatesMap: Record<string, number> = {};
  
  console.log(`Creating run dates map for year ${year}`);
  console.log(`Input data: ${runningData.length} runs`);
  
  // Process each run and add it to the map if it belongs to the selected year
  runningData.forEach(run => {
    if (!run.date) {
      console.warn('Found run without date:', run);
      return;
    }
    
    // Make sure we're parsing dates consistently
    const runDate = new Date(run.date);
    const runYear = runDate.getFullYear();
    
    // Check if run is from the selected year
    if (runYear === year) {
      // Use ISO format date (YYYY-MM-DD) as key
      const dateKey = formatDateString(run.date);
      
      // Add or update the distance for this date
      runDatesMap[dateKey] = (runDatesMap[dateKey] || 0) + run.distance;
      
      // Debug log to see what's being added
      console.log(`Added run for date ${dateKey} with distance ${run.distance}km (Year: ${runYear})`);
    } else {
      console.log(`Skipping run for ${run.date} - year ${runYear} doesn't match target ${year}`);
    }
  });
  
  console.log(`Total run dates map for year ${year}:`, Object.keys(runDatesMap).length);
  console.log(`Run dates:`, Object.keys(runDatesMap));
  
  return runDatesMap;
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
      
      console.log(`Added stats for ${dateStr} (month ${month}): +1 day, +${distance}km`);
    }
  });
  
  console.log(`Monthly stats for year ${year}:`, stats);
  return stats;
};

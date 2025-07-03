
// Re-export all utilities from their dedicated files for backward compatibility
export { calculateTotalStats, formatPace, formatTime } from './statsCalculations';
export { calculateMonthlyStats, prepareChartData } from './monthlyStatsCalculations';
export { calculateRunsPerHour } from './runsPerHourCalculations';
export { calculateWeeklyPaceStats } from './weeklyPaceCalculations';
export { calculateWeeklyDistanceStats } from './weeklyDistanceCalculations';
export { generateHeatmapData } from './heatmapCalculations';
export { 
  calculatePaceDistanceCorrelation, 
  getDistanceRangeColor, 
  getDistanceRangeLabel,
  formatPaceForChart
} from './paceDistanceAnalysis';

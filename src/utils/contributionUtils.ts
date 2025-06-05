
import { RunData } from '@/data/runningData';

export interface ContributionDay {
  date: string;
  level: number;
  distance: number;
  runs: number;
}

/**
 * Creates contribution data for a specific year
 * @param runningData Array of run data
 * @param year Year to generate data for
 * @returns Array of contribution days for the entire year
 */
export const createContributionData = (runningData: RunData[], year: number): ContributionDay[] => {
  console.log(`Creating contribution data for year ${year}`);
  
  // Create a map of dates to running data
  const runsByDate = new Map<string, { distance: number; runs: number }>();
  
  // Process running data for the selected year
  runningData.forEach(run => {
    const runDate = new Date(run.date);
    if (runDate.getFullYear() === year) {
      const dateKey = run.date;
      const existing = runsByDate.get(dateKey) || { distance: 0, runs: 0 };
      runsByDate.set(dateKey, {
        distance: existing.distance + run.distance,
        runs: existing.runs + 1
      });
    }
  });

  // Generate all days of the year
  const contributionData: ContributionDay[] = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const dateStr = date.toISOString().split('T')[0];
    const runData = runsByDate.get(dateStr) || { distance: 0, runs: 0 };
    
    contributionData.push({
      date: dateStr,
      level: calculateIntensityLevel(runData.distance),
      distance: runData.distance,
      runs: runData.runs
    });
  }
  
  console.log(`Generated ${contributionData.length} days for year ${year}`);
  console.log(`Active days: ${contributionData.filter(d => d.level > 0).length}`);
  
  return contributionData;
};

/**
 * Calculates the intensity level (0-4) based on total distance for the day
 * @param totalDistance Total distance run in the day
 * @returns Intensity level from 0 (no activity) to 4 (very high activity)
 */
const calculateIntensityLevel = (totalDistance: number): number => {
  if (totalDistance === 0) return 0;
  if (totalDistance < 5) return 1;      // < 5km
  if (totalDistance < 10) return 2;     // 5-10km
  if (totalDistance < 20) return 3;     // 10-20km
  return 4;                             // 20km+
};

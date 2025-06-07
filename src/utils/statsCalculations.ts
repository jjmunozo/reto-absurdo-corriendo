
import { RunData } from '@/data/runningData';

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

export const formatPace = (pace: number) => {
  const minutes = Math.floor(pace);
  const seconds = Math.round((pace - minutes) * 60);
  return `${minutes}'${seconds.toString().padStart(2, '0')}"`;
};

export const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

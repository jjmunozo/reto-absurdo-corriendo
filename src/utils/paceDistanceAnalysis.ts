
import { RunData } from '@/data/runningData';

export interface PaceDistanceCorrelation {
  correlation: number;
  rSquared: number;
  slope: number;
  intercept: number;
  averagePaceByRange: {
    shortRun: { range: string; avgPace: number; count: number }; // 3-7km
    mediumRun: { range: string; avgPace: number; count: number }; // 8-15km
    longRun: { range: string; avgPace: number; count: number }; // 16-25km
    marathon: { range: string; avgPace: number; count: number }; // 26km+
  };
  projectedPace100km: number;
  bestPaceRun: RunData;
  worstPaceRun: RunData;
  outliers: RunData[];
}

export const calculatePaceDistanceCorrelation = (runData: RunData[]): PaceDistanceCorrelation => {
  if (runData.length === 0) {
    return {
      correlation: 0,
      rSquared: 0,
      slope: 0,
      intercept: 0,
      averagePaceByRange: {
        shortRun: { range: '3-7km', avgPace: 0, count: 0 },
        mediumRun: { range: '8-15km', avgPace: 0, count: 0 },
        longRun: { range: '16-25km', avgPace: 0, count: 0 },
        marathon: { range: '26km+', avgPace: 0, count: 0 }
      },
      projectedPace100km: 0,
      bestPaceRun: runData[0],
      worstPaceRun: runData[0],
      outliers: []
    };
  }

  // Calcular correlación de Pearson
  const n = runData.length;
  const distances = runData.map(run => run.distance);
  const paces = runData.map(run => run.avgPace);
  
  const sumX = distances.reduce((a, b) => a + b, 0);
  const sumY = paces.reduce((a, b) => a + b, 0);
  const sumXY = distances.reduce((sum, x, i) => sum + x * paces[i], 0);
  const sumXX = distances.reduce((sum, x) => sum + x * x, 0);
  const sumYY = paces.reduce((sum, y) => sum + y * y, 0);
  
  const correlation = (n * sumXY - sumX * sumY) / 
    Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  
  const rSquared = correlation * correlation;
  
  // Calcular línea de tendencia (regresión lineal)
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Agrupar por rangos de distancia
  const shortRuns = runData.filter(run => run.distance >= 3 && run.distance < 8);
  const mediumRuns = runData.filter(run => run.distance >= 8 && run.distance < 16);
  const longRuns = runData.filter(run => run.distance >= 16 && run.distance < 26);
  const marathonRuns = runData.filter(run => run.distance >= 26);
  
  const averagePaceByRange = {
    shortRun: {
      range: '3-7km',
      avgPace: shortRuns.length > 0 ? shortRuns.reduce((sum, run) => sum + run.avgPace, 0) / shortRuns.length : 0,
      count: shortRuns.length
    },
    mediumRun: {
      range: '8-15km',
      avgPace: mediumRuns.length > 0 ? mediumRuns.reduce((sum, run) => sum + run.avgPace, 0) / mediumRuns.length : 0,
      count: mediumRuns.length
    },
    longRun: {
      range: '16-25km',
      avgPace: longRuns.length > 0 ? longRuns.reduce((sum, run) => sum + run.avgPace, 0) / longRuns.length : 0,
      count: longRuns.length
    },
    marathon: {
      range: '26km+',
      avgPace: marathonRuns.length > 0 ? marathonRuns.reduce((sum, run) => sum + run.avgPace, 0) / marathonRuns.length : 0,
      count: marathonRuns.length
    }
  };
  
  // Proyectar pace para 100km usando la tendencia
  const projectedPace100km = slope * 100 + intercept;
  
  // Encontrar mejor y peor pace
  const bestPaceRun = runData.reduce((best, current) => 
    current.avgPace < best.avgPace ? current : best
  );
  const worstPaceRun = runData.reduce((worst, current) => 
    current.avgPace > worst.avgPace ? current : worst
  );
  
  // Detectar outliers (carreras con pace muy diferente al esperado)
  const outliers = runData.filter(run => {
    const expectedPace = slope * run.distance + intercept;
    const deviation = Math.abs(run.avgPace - expectedPace);
    return deviation > 0.3; // Más de 0.3 min/km de diferencia
  });
  
  return {
    correlation,
    rSquared,
    slope,
    intercept,
    averagePaceByRange,
    projectedPace100km,
    bestPaceRun,
    worstPaceRun,
    outliers
  };
};

export const getDistanceRangeColor = (distance: number): string => {
  if (distance < 8) return '#10B981'; // Verde para distancias cortas
  if (distance < 16) return '#3B82F6'; // Azul para distancias medias
  if (distance < 26) return '#F59E0B'; // Amarillo para distancias largas
  return '#EF4444'; // Rojo para maratón+
};

export const getDistanceRangeLabel = (distance: number): string => {
  if (distance < 8) return 'Distancia Corta (3-7km)';
  if (distance < 16) return 'Distancia Media (8-15km)';
  if (distance < 26) return 'Distancia Larga (16-25km)';
  return 'Maratón+ (26km+)';
};

export const formatPaceForChart = (pace: number): string => {
  const minutes = Math.floor(pace);
  const seconds = Math.round((pace - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

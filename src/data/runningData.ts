
export interface RunData {
  id: number;
  date: string;
  distance: number; // in kilometers
  duration: number; // in minutes
  elevation: number; // in meters
  avgPace: number; // in minutes per kilometer
  location: string;
}

export interface MonthlyStats {
  month: string;
  distance: number;
  runs: number;
  time: number;
}

export const runningData: RunData[] = [
  { id: 1, date: '2025-04-30', distance: 5.2, duration: 28, elevation: 45, avgPace: 5.4, location: 'Parque Chapultepec' },
  { id: 2, date: '2025-04-28', distance: 8.1, duration: 43, elevation: 65, avgPace: 5.3, location: 'Paseo de la Reforma' },
  { id: 3, date: '2025-04-26', distance: 3.5, duration: 19, elevation: 20, avgPace: 5.4, location: 'Condesa' },
  { id: 4, date: '2025-04-24', distance: 10.2, duration: 54, elevation: 120, avgPace: 5.3, location: 'Bosque de Tlalpan' },
  { id: 5, date: '2025-04-21', distance: 5.5, duration: 29, elevation: 50, avgPace: 5.3, location: 'Parque Chapultepec' },
  { id: 6, date: '2025-04-19', distance: 15.3, duration: 85, elevation: 180, avgPace: 5.6, location: 'Desierto de los Leones' },
  { id: 7, date: '2025-04-17', distance: 6.2, duration: 32, elevation: 55, avgPace: 5.2, location: 'Condesa' },
  { id: 8, date: '2025-04-14', distance: 5.0, duration: 26, elevation: 30, avgPace: 5.2, location: 'Parque Chapultepec' },
  { id: 9, date: '2025-04-12', distance: 8.4, duration: 45, elevation: 90, avgPace: 5.4, location: 'Paseo de la Reforma' },
  { id: 10, date: '2025-04-09', distance: 21.1, duration: 115, elevation: 250, avgPace: 5.5, location: 'Medio Maratón CDMX' },
  { id: 11, date: '2025-04-05', distance: 6.3, duration: 33, elevation: 60, avgPace: 5.2, location: 'Condesa' },
  { id: 12, date: '2025-04-02', distance: 10.5, duration: 56, elevation: 110, avgPace: 5.3, location: 'Bosque de Tlalpan' },
  { id: 13, date: '2025-03-30', distance: 7.2, duration: 39, elevation: 70, avgPace: 5.4, location: 'Parque Chapultepec' },
  { id: 14, date: '2025-03-27', distance: 9.1, duration: 49, elevation: 85, avgPace: 5.4, location: 'Paseo de la Reforma' },
  { id: 15, date: '2025-03-24', distance: 5.7, duration: 30, elevation: 40, avgPace: 5.3, location: 'Condesa' },
  { id: 16, date: '2025-03-21', distance: 12.3, duration: 66, elevation: 140, avgPace: 5.4, location: 'Bosque de Tlalpan' },
  { id: 17, date: '2025-03-18', distance: 6.5, duration: 35, elevation: 60, avgPace: 5.4, location: 'Parque Chapultepec' },
  { id: 18, date: '2025-03-15', distance: 18.2, duration: 99, elevation: 200, avgPace: 5.4, location: 'Desierto de los Leones' },
  { id: 19, date: '2025-03-12', distance: 6.3, duration: 33, elevation: 50, avgPace: 5.2, location: 'Condesa' },
  { id: 20, date: '2025-03-09', distance: 5.5, duration: 29, elevation: 35, avgPace: 5.3, location: 'Parque Chapultepec' },
  { id: 21, date: '2025-03-06', distance: 9.3, duration: 50, elevation: 95, avgPace: 5.4, location: 'Paseo de la Reforma' },
  { id: 22, date: '2025-03-03', distance: 7.2, duration: 38, elevation: 65, avgPace: 5.3, location: 'Condesa' },
  { id: 23, date: '2025-03-01', distance: 10.8, duration: 58, elevation: 120, avgPace: 5.4, location: 'Bosque de Tlalpan' },
  { id: 24, date: '2025-02-27', distance: 6.7, duration: 36, elevation: 60, avgPace: 5.4, location: 'Parque Chapultepec' },
  { id: 25, date: '2025-02-24', distance: 9.5, duration: 51, elevation: 90, avgPace: 5.4, location: 'Paseo de la Reforma' },
  { id: 26, date: '2025-02-21', distance: 5.8, duration: 31, elevation: 45, avgPace: 5.3, location: 'Condesa' },
  { id: 27, date: '2025-02-18', distance: 42.2, duration: 232, elevation: 350, avgPace: 5.5, location: 'Maratón CDMX' },
  { id: 28, date: '2025-02-12', distance: 8.6, duration: 46, elevation: 80, avgPace: 5.3, location: 'Bosque de Tlalpan' },
  { id: 29, date: '2025-02-09', distance: 6.9, duration: 37, elevation: 65, avgPace: 5.4, location: 'Parque Chapultepec' },
  { id: 30, date: '2025-02-06', distance: 10.1, duration: 54, elevation: 105, avgPace: 5.3, location: 'Paseo de la Reforma' }
];

export const monthlyStats: MonthlyStats[] = [
  { month: 'Mayo', distance: 0, runs: 0, time: 0 },
  { month: 'Abril', distance: 105.3, runs: 12, time: 565 },
  { month: 'Marzo', distance: 94.9, runs: 11, time: 513 },
  { month: 'Febrero', distance: 89.8, runs: 7, time: 487 },
  { month: 'Enero', distance: 82.5, runs: 10, time: 445 },
  { month: 'Diciembre', distance: 75.3, runs: 9, time: 405 },
];

// Calcula estadísticas totales
export const calculateTotalStats = () => {
  return {
    totalDistance: runningData.reduce((sum, run) => sum + run.distance, 0),
    totalRuns: runningData.length,
    totalTime: runningData.reduce((sum, run) => sum + run.duration, 0),
    totalElevation: runningData.reduce((sum, run) => sum + run.elevation, 0),
    avgPace: runningData.reduce((sum, run) => sum + run.avgPace, 0) / runningData.length,
    longestRun: Math.max(...runningData.map(run => run.distance)),
  };
};

// Función para obtener los datos para el heatmap
export const getHeatmapData = () => {
  // Asumir los últimos 90 días
  const today = new Date();
  const heatmapData = [];
  
  for (let i = 90; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    // Buscar si hay una carrera en esa fecha
    const run = runningData.find(r => r.date === dateString);
    
    heatmapData.push({
      date: dateString,
      value: run ? run.distance : 0
    });
  }
  
  return heatmapData;
};

// Obtener datos para gráficos
export const getChartData = () => {
  return monthlyStats.slice().reverse();
};

export interface RunData {
  id: number;
  date: string;
  distance: number; // in kilometers
  duration: number; // in minutes
  elevation: number; // in meters
  avgPace: number; // in minutes per kilometer
  location: string;
  startTimeLocal: string; // full ISO datetime string
  hasPR?: boolean;
  prType?: string | null;
  prDescription?: string | null;
}

export interface MonthlyStats {
  month: string;
  distance: number;
  runs: number;
  time: number;
}

export const runningData: RunData[] = [
  // Abril 2025
  { id: 1, date: '2025-04-30', distance: 5.2, duration: 28, elevation: 45, avgPace: 5.4, location: 'Parque Chapultepec', startTimeLocal: '2025-04-30T06:30:00Z' },
  { id: 2, date: '2025-04-28', distance: 8.1, duration: 43, elevation: 65, avgPace: 5.3, location: 'Paseo de la Reforma', startTimeLocal: '2025-04-28T07:15:00Z' },
  { id: 3, date: '2025-04-26', distance: 3.5, duration: 19, elevation: 20, avgPace: 5.4, location: 'Condesa', startTimeLocal: '2025-04-26T17:45:00Z' },
  { id: 4, date: '2025-04-24', distance: 10.2, duration: 54, elevation: 120, avgPace: 5.3, location: 'Bosque de Tlalpan', startTimeLocal: '2025-04-24T06:00:00Z' },
  { id: 5, date: '2025-04-21', distance: 5.5, duration: 29, elevation: 50, avgPace: 5.3, location: 'Parque Chapultepec', startTimeLocal: '2025-04-21T16:30:00Z' },
  { id: 6, date: '2025-04-19', distance: 15.3, duration: 85, elevation: 180, avgPace: 5.6, location: 'Desierto de los Leones', startTimeLocal: '2025-04-19T08:00:00Z' },
  { id: 7, date: '2025-04-17', distance: 6.2, duration: 32, elevation: 55, avgPace: 5.2, location: 'Condesa', startTimeLocal: '2025-04-17T15:00:00Z' },
  { id: 8, date: '2025-04-14', distance: 5.0, duration: 26, elevation: 30, avgPace: 5.2, location: 'Parque Chapultepec', startTimeLocal: '2025-04-14T09:00:00Z' },
  { id: 9, date: '2025-04-12', distance: 8.4, duration: 45, elevation: 90, avgPace: 5.4, location: 'Paseo de la Reforma', startTimeLocal: '2025-04-12T10:00:00Z' },
  { id: 10, date: '2025-04-09', distance: 21.1, duration: 115, elevation: 250, avgPace: 5.5, location: 'Medio Maratón CDMX', startTimeLocal: '2025-04-09T11:00:00Z' },
  { id: 11, date: '2025-04-05', distance: 6.3, duration: 33, elevation: 60, avgPace: 5.2, location: 'Condesa', startTimeLocal: '2025-04-05T12:00:00Z' },
  { id: 12, date: '2025-04-02', distance: 10.5, duration: 56, elevation: 110, avgPace: 5.3, location: 'Bosque de Tlalpan', startTimeLocal: '2025-04-02T13:00:00Z' },
  
  // Marzo 2025
  { id: 13, date: '2025-03-30', distance: 7.2, duration: 39, elevation: 70, avgPace: 5.4, location: 'Parque Chapultepec', startTimeLocal: '2025-03-30T14:00:00Z' },
  { id: 14, date: '2025-03-27', distance: 9.1, duration: 49, elevation: 85, avgPace: 5.4, location: 'Paseo de la Reforma', startTimeLocal: '2025-03-27T15:00:00Z' },
  { id: 15, date: '2025-03-24', distance: 5.7, duration: 30, elevation: 40, avgPace: 5.3, location: 'Condesa', startTimeLocal: '2025-03-24T16:00:00Z' },
  { id: 16, date: '2025-03-21', distance: 12.3, duration: 66, elevation: 140, avgPace: 5.4, location: 'Bosque de Tlalpan', startTimeLocal: '2025-03-21T17:00:00Z' },
  { id: 17, date: '2025-03-18', distance: 6.5, duration: 35, elevation: 60, avgPace: 5.4, location: 'Parque Chapultepec', startTimeLocal: '2025-03-18T18:00:00Z' },
  { id: 18, date: '2025-03-15', distance: 18.2, duration: 99, elevation: 200, avgPace: 5.4, location: 'Desierto de los Leones', startTimeLocal: '2025-03-15T19:00:00Z' },
  { id: 19, date: '2025-03-12', distance: 6.3, duration: 33, elevation: 50, avgPace: 5.2, location: 'Condesa', startTimeLocal: '2025-03-12T20:00:00Z' },
  { id: 20, date: '2025-03-09', distance: 5.5, duration: 29, elevation: 35, avgPace: 5.3, location: 'Parque Chapultepec', startTimeLocal: '2025-03-09T21:00:00Z' },
  { id: 21, date: '2025-03-06', distance: 9.3, duration: 50, elevation: 95, avgPace: 5.4, location: 'Paseo de la Reforma', startTimeLocal: '2025-03-06T22:00:00Z' },
  { id: 22, date: '2025-03-03', distance: 7.2, duration: 38, elevation: 65, avgPace: 5.3, location: 'Condesa', startTimeLocal: '2025-03-03T23:00:00Z' },
  { id: 23, date: '2025-03-01', distance: 10.8, duration: 58, elevation: 120, avgPace: 5.4, location: 'Bosque de Tlalpan', startTimeLocal: '2025-03-01T00:00:00Z' },
  
  // Febrero 2025
  { id: 24, date: '2025-02-27', distance: 6.7, duration: 36, elevation: 60, avgPace: 5.4, location: 'Parque Chapultepec', startTimeLocal: '2025-02-27T01:00:00Z' },
  { id: 25, date: '2025-02-24', distance: 9.5, duration: 51, elevation: 90, avgPace: 5.4, location: 'Paseo de la Reforma', startTimeLocal: '2025-02-24T02:00:00Z' },
  { id: 26, date: '2025-02-21', distance: 5.8, duration: 31, elevation: 45, avgPace: 5.3, location: 'Condesa', startTimeLocal: '2025-02-21T03:00:00Z' },
  { id: 27, date: '2025-02-18', distance: 42.2, duration: 232, elevation: 350, avgPace: 5.5, location: 'Maratón CDMX', startTimeLocal: '2025-02-18T04:00:00Z' },
  { id: 28, date: '2025-02-12', distance: 8.6, duration: 46, elevation: 80, avgPace: 5.3, location: 'Bosque de Tlalpan', startTimeLocal: '2025-02-12T05:00:00Z' },
  { id: 29, date: '2025-02-09', distance: 6.9, duration: 37, elevation: 65, avgPace: 5.4, location: 'Parque Chapultepec', startTimeLocal: '2025-02-09T06:00:00Z' },
  { id: 30, date: '2025-02-06', distance: 10.1, duration: 54, elevation: 105, avgPace: 5.3, location: 'Paseo de la Reforma', startTimeLocal: '2025-02-06T07:00:00Z' },
  
  // Enero 2025
  { id: 31, date: '2025-01-31', distance: 7.5, duration: 40, elevation: 60, avgPace: 5.3, location: 'Parque Chapultepec', startTimeLocal: '2025-01-31T08:00:00Z' },
  { id: 32, date: '2025-01-29', distance: 9.2, duration: 49, elevation: 85, avgPace: 5.3, location: 'Paseo de la Reforma', startTimeLocal: '2025-01-29T09:00:00Z' },
  { id: 33, date: '2025-01-27', distance: 6.3, duration: 33, elevation: 40, avgPace: 5.2, location: 'Condesa', startTimeLocal: '2025-01-27T10:00:00Z' },
  { id: 34, date: '2025-01-24', distance: 11.8, duration: 63, elevation: 130, avgPace: 5.3, location: 'Bosque de Tlalpan', startTimeLocal: '2025-01-24T11:00:00Z' },
  { id: 35, date: '2025-01-20', distance: 5.5, duration: 29, elevation: 35, avgPace: 5.3, location: 'Parque Chapultepec', startTimeLocal: '2025-01-20T12:00:00Z' },
  { id: 36, date: '2025-01-17', distance: 8.7, duration: 46, elevation: 75, avgPace: 5.3, location: 'Paseo de la Reforma', startTimeLocal: '2025-01-17T13:00:00Z' },
  { id: 37, date: '2025-01-12', distance: 16.5, duration: 90, elevation: 190, avgPace: 5.5, location: 'Desierto de los Leones', startTimeLocal: '2025-01-12T14:00:00Z' },
  { id: 38, date: '2025-01-08', distance: 6.2, duration: 33, elevation: 50, avgPace: 5.3, location: 'Condesa', startTimeLocal: '2025-01-08T15:00:00Z' },
  { id: 39, date: '2025-01-05', distance: 10.8, duration: 57, elevation: 120, avgPace: 5.3, location: 'Bosque de Tlalpan', startTimeLocal: '2025-01-05T16:00:00Z' },
  
  // Diciembre 2024
  { id: 40, date: '2024-12-30', distance: 5.5, duration: 29, elevation: 40, avgPace: 5.3, location: 'Parque Chapultepec', startTimeLocal: '2024-12-30T17:00:00Z' },
  { id: 41, date: '2024-12-28', distance: 9.1, duration: 48, elevation: 85, avgPace: 5.3, location: 'Paseo de la Reforma', startTimeLocal: '2024-12-28T18:00:00Z' },
  { id: 42, date: '2024-12-26', distance: 6.2, duration: 33, elevation: 55, avgPace: 5.3, location: 'Condesa', startTimeLocal: '2024-12-26T19:00:00Z' },
  { id: 43, date: '2024-12-23', distance: 8.5, duration: 45, elevation: 75, avgPace: 5.3, location: 'Bosque de Tlalpan', startTimeLocal: '2024-12-23T20:00:00Z' },
  { id: 44, date: '2024-12-20', distance: 5.7, duration: 30, elevation: 45, avgPace: 5.3, location: 'Parque Chapultepec', startTimeLocal: '2024-12-20T21:00:00Z' },
  { id: 45, date: '2024-12-16', distance: 15.3, duration: 82, elevation: 170, avgPace: 5.4, location: 'Desierto de los Leones', startTimeLocal: '2024-12-16T22:00:00Z' },
  { id: 46, date: '2024-12-12', distance: 7.2, duration: 38, elevation: 65, avgPace: 5.3, location: 'Paseo de la Reforma', startTimeLocal: '2024-12-12T23:00:00Z' },
  { id: 47, date: '2024-12-09', distance: 6.5, duration: 34, elevation: 50, avgPace: 5.2, location: 'Condesa', startTimeLocal: '2024-12-09T00:00:00Z' },
  { id: 48, date: '2024-12-05', distance: 11.3, duration: 60, elevation: 125, avgPace: 5.3, location: 'Bosque de Tlalpan', startTimeLocal: '2024-12-05T01:00:00Z' },
  
  // Noviembre 2024
  { id: 49, date: '2024-11-30', distance: 7.8, duration: 41, elevation: 70, avgPace: 5.3, location: 'Parque Chapultepec', startTimeLocal: '2024-11-30T02:00:00Z' },
  { id: 50, date: '2024-11-27', distance: 9.5, duration: 51, elevation: 90, avgPace: 5.4, location: 'Paseo de la Reforma', startTimeLocal: '2024-11-27T03:00:00Z' },
  { id: 51, date: '2024-11-25', distance: 5.3, duration: 28, elevation: 40, avgPace: 5.3, location: 'Condesa', startTimeLocal: '2024-11-25T04:00:00Z' },
  { id: 52, date: '2024-11-21', distance: 21.1, duration: 115, elevation: 245, avgPace: 5.5, location: 'Medio Maratón CDMX', startTimeLocal: '2024-11-21T05:00:00Z' },
  { id: 53, date: '2024-11-18', distance: 7.2, duration: 38, elevation: 65, avgPace: 5.3, location: 'Parque Chapultepec', startTimeLocal: '2024-11-18T06:00:00Z' },
  { id: 54, date: '2024-11-15', distance: 10.6, duration: 56, elevation: 110, avgPace: 5.3, location: 'Bosque de Tlalpan', startTimeLocal: '2024-11-15T07:00:00Z' },
  { id: 55, date: '2024-11-11', distance: 6.8, duration: 36, elevation: 55, avgPace: 5.3, location: 'Paseo de la Reforma', startTimeLocal: '2024-11-11T08:00:00Z' },
  { id: 56, date: '2024-11-08', distance: 8.3, duration: 44, elevation: 75, avgPace: 5.3, location: 'Condesa', startTimeLocal: '2024-11-08T09:00:00Z' },
  { id: 57, date: '2024-11-05', distance: 6.5, duration: 34, elevation: 50, avgPace: 5.2, location: 'Parque Chapultepec', startTimeLocal: '2024-11-05T10:00:00Z' },
];

export const monthlyStats: MonthlyStats[] = [
  { month: 'Mayo', distance: 0, runs: 0, time: 0 },
  { month: 'Abril', distance: 105.3, runs: 12, time: 565 },
  { month: 'Marzo', distance: 94.9, runs: 11, time: 513 },
  { month: 'Febrero', distance: 89.8, runs: 7, time: 487 },
  { month: 'Enero', distance: 82.5, runs: 9, time: 440 },
  { month: 'Diciembre', distance: 75.3, runs: 9, time: 399 },
  { month: 'Noviembre', distance: 83.1, runs: 9, time: 443 },
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

// Función para obtener estadísticas de días corridos por mes
export const getMonthlyRunDays = () => {
  const monthlyDays: Record<string, number> = {};
  
  // Inicializar todos los meses
  for (let i = 0; i < 12; i++) {
    const monthKey = `${new Date().getFullYear()}-${(i + 1).toString().padStart(2, '0')}`;
    monthlyDays[monthKey] = 0;
  }
  
  // Contar días por mes
  runningData.forEach(run => {
    const date = new Date(run.date);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    
    if (monthlyDays[monthKey] !== undefined) {
      monthlyDays[monthKey]++;
    }
  });
  
  return monthlyDays;
};

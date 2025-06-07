
import { RunData } from '@/data/runningData';

export const generateHeatmapData = (runData: RunData[]) => {
  // Obtenemos los últimos 365 días para mostrar un año completo
  const today = new Date();
  const heatmapData = [];
  
  for (let i = 365; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    // Buscar si hay una carrera en esa fecha
    const run = runData.find(r => r.date === dateString);
    
    heatmapData.push({
      date: dateString,
      value: run ? run.distance : 0
    });
  }
  
  return heatmapData;
};

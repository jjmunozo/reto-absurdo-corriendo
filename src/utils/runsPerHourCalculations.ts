
import { RunData } from '@/data/runningData';

export const calculateRunsPerHour = (runData: RunData[]): { hour: string, runs: number }[] => {
  console.log('⏰ calculateRunsPerHour: Procesando', runData.length, 'carreras');
  
  // Inicializar array con todas las horas (0-23)
  const hoursData = Array.from({ length: 24 }).map((_, index) => ({
    hour: index.toString().padStart(2, '0') + ':00',
    runs: 0
  }));
  
  // Contar carreras por hora - usando la zona horaria de Costa Rica
  runData.forEach(run => {
    try {
      // Si tenemos el campo startTimeLocal (fecha-hora completa)
      if (run.startTimeLocal) {
        // Crear fecha respetando la zona horaria original del CSV
        const dateObj = new Date(run.startTimeLocal);
        
        // Extraer hora usando zona horaria de Costa Rica
        const options: Intl.DateTimeFormatOptions = {
          hour: 'numeric',
          hour12: false,
          timeZone: 'America/Costa_Rica'
        };
        
        const hourString = dateObj.toLocaleString('en-US', options);
        const hourOfDay = parseInt(hourString);
        
        // Debug para ver las horas extraídas
        console.log(`⏰ Run hora corregida: ${run.date}, Start Time: ${run.startTimeLocal}, Hour extraída: ${hourOfDay}`);
        
        // Incrementar contador para esa hora
        if (hourOfDay >= 0 && hourOfDay < 24) {
          hoursData[hourOfDay].runs += 1;
        }
      } else {
        console.warn(`⏰ Run sin startTimeLocal: ${run.date}`);
      }
    } catch (error) {
      console.error(`⏰ Error procesando hora para carrera ${run.date}:`, error);
    }
  });
  
  console.log('⏰ Resultado final por horas (corregido):', hoursData.filter(h => h.runs > 0));
  return hoursData;
};

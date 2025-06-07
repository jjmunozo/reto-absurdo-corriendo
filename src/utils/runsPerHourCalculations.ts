
import { RunData } from '@/data/runningData';
import { toZonedTime, format } from 'date-fns-tz';

export const calculateRunsPerHour = (runData: RunData[]): { hour: string, runs: number }[] => {
  console.log('⏰ calculateRunsPerHour: Procesando', runData.length, 'carreras');
  
  // Inicializar array con todas las horas (0-23)
  const hoursData = Array.from({ length: 24 }).map((_, index) => ({
    hour: index.toString().padStart(2, '0') + ':00',
    runs: 0
  }));
  
  // La zona horaria de Costa Rica es UTC-6
  const timeZone = 'America/Costa_Rica';
  
  // Contar carreras por hora
  runData.forEach(run => {
    try {
      // Si tenemos el campo startTimeLocal (fecha-hora completa)
      if (run.startTimeLocal) {
        const dateObj = new Date(run.startTimeLocal);
        const crDateObj = toZonedTime(dateObj, timeZone);
        const hourOfDay = crDateObj.getHours();
        
        // Debug para ver las fechas transformadas
        console.log(`⏰ Run hora: ${run.date}, Start Time: ${run.startTimeLocal}, CR Time: ${format(crDateObj, 'yyyy-MM-dd HH:mm:ss', { timeZone })}, Hour: ${hourOfDay}`);
        
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
  
  console.log('⏰ Resultado final por horas:', hoursData.filter(h => h.runs > 0));
  return hoursData;
};

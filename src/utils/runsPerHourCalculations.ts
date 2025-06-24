
import { RunData } from '@/data/runningData';

export const calculateRunsPerHour = (runData: RunData[]): { hour: string, runs: number }[] => {
  console.log('⏰ calculateRunsPerHour: Procesando', runData.length, 'carreras');
  
  // Inicializar array con todas las horas (0-23)
  const hoursData = Array.from({ length: 24 }).map((_, index) => ({
    hour: index.toString().padStart(2, '0') + ':00',
    runs: 0
  }));
  
  // Contar carreras por hora - usando la hora local tal como está guardada
  runData.forEach(run => {
    try {
      // Si tenemos el campo startTimeLocal (fecha-hora completa)
      if (run.startTimeLocal) {
        const dateObj = new Date(run.startTimeLocal);
        const hourOfDay = dateObj.getHours();
        
        // Debug para ver las horas extraídas
        console.log(`⏰ Run hora: ${run.date}, Start Time: ${run.startTimeLocal}, Hour: ${hourOfDay}`);
        
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

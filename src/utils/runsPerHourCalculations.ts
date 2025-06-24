
import { RunData } from '@/data/runningData';

export const calculateRunsPerHour = (runData: RunData[]): { hour: string, runs: number }[] => {
  console.log('⏰ calculateRunsPerHour: Procesando SIN conversiones de zona horaria', runData.length, 'carreras');
  
  // Inicializar array con todas las horas (0-23)
  const hoursData = Array.from({ length: 24 }).map((_, index) => ({
    hour: index.toString().padStart(2, '0') + ':00',
    runs: 0
  }));
  
  // Contar carreras por hora - extrayendo directamente del string
  runData.forEach(run => {
    try {
      // Si tenemos el campo startTimeLocal (fecha-hora completa)
      if (run.startTimeLocal) {
        // Extraer hora directamente del string timestamp
        const timePart = run.startTimeLocal.includes('T') 
          ? run.startTimeLocal.split('T')[1] 
          : run.startTimeLocal.split(' ')[1];
        
        if (timePart) {
          const hourString = timePart.split(':')[0];
          const hourOfDay = parseInt(hourString);
          
          // Debug para ver las horas extraídas
          console.log(`⏰ Run hora SIN conversiones: ${run.date}, Start Time: ${run.startTimeLocal}, Hour extraída: ${hourOfDay}`);
          
          // Incrementar contador para esa hora
          if (hourOfDay >= 0 && hourOfDay < 24) {
            hoursData[hourOfDay].runs += 1;
          }
        } else {
          console.warn(`⏰ No se pudo extraer hora de: ${run.startTimeLocal}`);
        }
      } else {
        console.warn(`⏰ Run sin startTimeLocal: ${run.date}`);
      }
    } catch (error) {
      console.error(`⏰ Error procesando hora para carrera ${run.date}:`, error);
    }
  });
  
  console.log('⏰ Resultado final por horas (SIN conversiones):', hoursData.filter(h => h.runs > 0));
  return hoursData;
};

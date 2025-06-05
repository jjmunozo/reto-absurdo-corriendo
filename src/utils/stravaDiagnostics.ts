
import { RunData } from '@/data/runningData';

export interface DiagnosticResult {
  step: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  data?: any;
}

/**
 * Ejecuta diagnósticos del nuevo sistema Strava
 */
export const runStravaDiagnostics = async (): Promise<DiagnosticResult[]> => {
  const results: DiagnosticResult[] = [];

  // 1. Verificar disponibilidad del endpoint API
  try {
    console.log('🔍 Verificando endpoint /api/strava...');
    
    const response = await fetch('/api/strava');
    
    if (response.ok) {
      const data: RunData[] = await response.json();
      
      results.push({
        step: 'Conexión API',
        status: 'success',
        message: `Endpoint funcionando correctamente. ${data.length} actividades cargadas.`,
        data: { activitiesCount: data.length, endpoint: '/api/strava' }
      });
      
      // 2. Verificar estructura de datos
      if (data.length > 0) {
        const sampleRun = data[0];
        const requiredFields = ['id', 'date', 'distance', 'duration', 'elevation', 'avgPace', 'location'];
        const missingFields = requiredFields.filter(field => !(field in sampleRun));
        
        if (missingFields.length === 0) {
          results.push({
            step: 'Estructura de Datos',
            status: 'success',
            message: 'Todos los campos requeridos están presentes.',
            data: { sampleRun, requiredFields }
          });
        } else {
          results.push({
            step: 'Estructura de Datos',
            status: 'warning',
            message: `Campos faltantes: ${missingFields.join(', ')}`,
            data: { missingFields, sampleRun }
          });
        }
        
        // 3. Verificar datos de carreras
        const runningActivities = data.filter(activity => activity.distance > 0);
        
        results.push({
          step: 'Actividades de Carrera',
          status: runningActivities.length > 0 ? 'success' : 'warning',
          message: `${runningActivities.length} de ${data.length} actividades son carreras válidas.`,
          data: { 
            totalActivities: data.length, 
            runningActivities: runningActivities.length,
            samples: runningActivities.slice(0, 3).map(run => ({
              date: run.date,
              distance: run.distance,
              location: run.location
            }))
          }
        });
        
        // 4. Verificar fechas y horas
        const activitiesWithTime = data.filter(activity => activity.startTimeLocal);
        
        results.push({
          step: 'Datos de Tiempo',
          status: activitiesWithTime.length > 0 ? 'success' : 'warning',
          message: `${activitiesWithTime.length} de ${data.length} actividades tienen datos de hora.`,
          data: { 
            withTimeData: activitiesWithTime.length,
            total: data.length,
            sampleTimes: activitiesWithTime.slice(0, 3).map(run => ({
              date: run.date,
              startTime: run.startTimeLocal
            }))
          }
        });
        
      } else {
        results.push({
          step: 'Datos de Actividades',
          status: 'warning',
          message: 'No se encontraron actividades en la respuesta.',
          data: { activitiesCount: 0 }
        });
      }
      
    } else {
      results.push({
        step: 'Conexión API',
        status: 'error',
        message: `Error HTTP ${response.status}: ${response.statusText}`,
        data: { status: response.status, statusText: response.statusText }
      });
    }
    
  } catch (error) {
    results.push({
      step: 'Conexión API',
      status: 'error',
      message: `Error de red: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      data: { error: error instanceof Error ? error.message : error }
    });
  }

  // 5. Verificar variables de entorno (simulado)
  results.push({
    step: 'Configuración Backend',
    status: 'warning',
    message: 'No se pueden verificar las variables de entorno desde el frontend. Revisar logs del servidor.',
    data: { 
      note: 'Las variables STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_ACCESS_TOKEN y STRAVA_REFRESH_TOKEN deben estar configuradas en el servidor.'
    }
  });

  return results;
};

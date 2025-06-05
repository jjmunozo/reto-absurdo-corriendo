
/**
 * Funciones de diagnóstico para Strava
 */

import { isAuthenticated, getAthleteInfo, getAccessToken } from '@/services/stravaService';
import { isAdminMode } from '@/services/dataExportService';
import { getAthleteActivities, getAllRunningActivities } from '@/services/stravaActivitiesService';

export interface DiagnosticResult {
  step: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  data?: any;
}

export const runStravaDiagnostics = async (): Promise<DiagnosticResult[]> => {
  const results: DiagnosticResult[] = [];
  
  // 1. Verificar modo administrador
  const adminMode = isAdminMode();
  results.push({
    step: 'Admin Mode',
    status: adminMode ? 'success' : 'warning',
    message: adminMode ? 'Modo administrador activado' : 'Modo administrador NO activado (necesario para datos de Strava)',
    data: { adminMode }
  });
  
  // 2. Verificar autenticación
  const authenticated = isAuthenticated();
  results.push({
    step: 'Authentication',
    status: authenticated ? 'success' : 'error',
    message: authenticated ? 'Usuario autenticado con Strava' : 'Usuario NO autenticado con Strava',
    data: { authenticated }
  });
  
  if (!authenticated) {
    results.push({
      step: 'Authentication Details',
      status: 'error',
      message: 'No se puede continuar sin autenticación',
      data: { localStorage: localStorage.getItem('strava_tokens') ? 'Tokens encontrados' : 'No hay tokens' }
    });
    return results;
  }
  
  // 3. Verificar información del atleta
  const athlete = getAthleteInfo();
  results.push({
    step: 'Athlete Info',
    status: athlete ? 'success' : 'warning',
    message: athlete ? `Información del atleta: ${athlete.firstname} ${athlete.lastname}` : 'No hay información del atleta',
    data: athlete
  });
  
  // 4. Verificar token de acceso
  try {
    const accessToken = await getAccessToken();
    results.push({
      step: 'Access Token',
      status: 'success',
      message: 'Token de acceso obtenido correctamente',
      data: { tokenLength: accessToken?.length || 0 }
    });
  } catch (error) {
    results.push({
      step: 'Access Token',
      status: 'error',
      message: `Error obteniendo token: ${error}`,
      data: { error: error.toString() }
    });
    return results;
  }
  
  // 5. Probar conexión con API de Strava (obtener primera página de actividades)
  try {
    const firstPageActivities = await getAthleteActivities(undefined, undefined, 1, 5);
    results.push({
      step: 'API Connection',
      status: 'success',
      message: `Conexión con API exitosa. ${firstPageActivities.length} actividades en primera página`,
      data: { 
        activitiesCount: firstPageActivities.length,
        firstActivity: firstPageActivities[0] ? {
          id: firstPageActivities[0].id,
          name: firstPageActivities[0].name,
          type: firstPageActivities[0].type,
          date: firstPageActivities[0].start_date_local
        } : null
      }
    });
  } catch (error) {
    results.push({
      step: 'API Connection',
      status: 'error',
      message: `Error conectando con API: ${error}`,
      data: { error: error.toString() }
    });
    return results;
  }
  
  // 6. Obtener todas las actividades de carrera
  try {
    const runningActivities = await getAllRunningActivities();
    const runActivities = runningActivities.filter(activity => activity.type === 'Run');
    
    results.push({
      step: 'Running Activities',
      status: runActivities.length > 0 ? 'success' : 'warning',
      message: `${runActivities.length} actividades de carrera encontradas de ${runningActivities.length} actividades totales`,
      data: { 
        totalActivities: runningActivities.length,
        runActivities: runActivities.length,
        activityTypes: [...new Set(runningActivities.map(a => a.type))]
      }
    });
    
    // 7. Analizar las fechas de las actividades
    if (runActivities.length > 0) {
      const dates = runActivities.map(a => a.start_date_local);
      const years = [...new Set(dates.map(d => new Date(d).getFullYear()))];
      
      results.push({
        step: 'Date Analysis',
        status: 'success',
        message: `Actividades encontradas en años: ${years.join(', ')}`,
        data: {
          dateRange: {
            earliest: dates.sort()[0],
            latest: dates.sort().reverse()[0]
          },
          years,
          sampleDates: dates.slice(0, 3)
        }
      });
    }
    
  } catch (error) {
    results.push({
      step: 'Running Activities',
      status: 'error',
      message: `Error obteniendo actividades: ${error}`,
      data: { error: error.toString() }
    });
  }
  
  return results;
};

export const logDiagnostics = async (): Promise<void> => {
  console.log('🔍 Iniciando diagnóstico de Strava...');
  const results = await runStravaDiagnostics();
  
  results.forEach(result => {
    const emoji = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`${emoji} ${result.step}: ${result.message}`);
    if (result.data) {
      console.log('   Data:', result.data);
    }
  });
  
  console.log('🔍 Diagnóstico completado');
};

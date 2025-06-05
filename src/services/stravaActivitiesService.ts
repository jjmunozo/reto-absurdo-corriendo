
/**
 * Service for handling Strava activities
 */

import { RunData } from '@/data/runningData';
import { StravaActivity } from '@/types/stravaTypes';
import { getAccessToken } from './stravaService'; // CAMBIO: usar el del servicio principal, no el de auth
import { convertStravaActivityToRunData } from './stravaUtils';

/**
 * Obtiene las actividades del atleta desde la API de Strava
 */
export const getAthleteActivities = async (
  before?: number,
  after?: number,
  page: number = 1,
  per_page: number = 100
): Promise<StravaActivity[]> => {
  try {
    console.log('🔑 Obteniendo token de acceso para actividades...');
    const accessToken = await getAccessToken();
    console.log('🔑 Token obtenido:', accessToken.substring(0, 10) + '...');
    
    let url = `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${per_page}`;
    
    if (before) {
      url += `&before=${before}`;
    }
    
    if (after) {
      url += `&after=${after}`;
    }
    
    console.log('🌐 Haciendo petición a Strava API:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    console.log('🌐 Respuesta de Strava API:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en respuesta de Strava:', response.status, errorText);
      throw new Error(`Error obteniendo actividades: ${response.status} - ${errorText}`);
    }

    const activities: StravaActivity[] = await response.json();
    console.log('✅ Actividades obtenidas:', activities.length);
    return activities;
  } catch (error) {
    console.error('❌ Error obteniendo actividades del atleta:', error);
    throw error;
  }
};

/**
 * Obtiene todas las actividades del tipo "Run" del atleta
 */
export const getAllRunningActivities = async (): Promise<StravaActivity[]> => {
  try {
    // Obtener todas las actividades
    const allActivities: StravaActivity[] = [];
    let page = 1;
    const per_page = 100;
    let hasMoreActivities = true;
    
    // Obtener todas las páginas de actividades
    while (hasMoreActivities) {
      const activities = await getAthleteActivities(undefined, undefined, page, per_page);
      
      if (activities.length === 0) {
        hasMoreActivities = false;
      } else {
        allActivities.push(...activities);
        page++;
      }
      
      // Evitar demasiadas peticiones a la API
      if (page > 5) {
        hasMoreActivities = false;
      }
    }
    
    // Filtrar solo las de tipo "Run"
    const runningActivities = allActivities.filter(activity => activity.type === 'Run');
    
    return runningActivities;
  } catch (error) {
    console.error('Error obteniendo actividades de carrera:', error);
    throw error;
  }
};

/**
 * Obtiene todas las actividades de carrera y las convierte al formato de nuestra aplicación
 */
export const getRunningData = async (): Promise<RunData[]> => {
  try {
    const runningActivities = await getAllRunningActivities();
    return runningActivities.map(convertStravaActivityToRunData);
  } catch (error) {
    console.error('Error obteniendo datos de carrera:', error);
    throw error;
  }
};

/**
 * Obtiene datos del atleta incluyendo estadísticas
 */
export const getAthleteStats = async (athleteId: number): Promise<any> => {
  try {
    const accessToken = await getAccessToken();
    
    const response = await fetch(`https://www.strava.com/api/v3/athletes/${athleteId}/stats`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error obteniendo estadísticas del atleta: ${response.status}`);
    }

    const stats = await response.json();
    return stats;
  } catch (error) {
    console.error('Error obteniendo estadísticas del atleta:', error);
    throw error;
  }
};

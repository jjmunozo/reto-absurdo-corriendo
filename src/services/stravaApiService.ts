
import { RunData } from '@/data/runningData';

interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  total_elevation_gain: number;
  start_date_local: string;
  type: string;
  location_city?: string;
  location_country?: string;
}

// Credenciales de Juan - Token actualizado con permisos de lectura de actividades
const STRAVA_CONFIG = {
  CLIENT_ID: '160774',
  CLIENT_SECRET: '5836512c42bdd300ac801e4b2d81bdff5228d281',
  ACCESS_TOKEN: 'a612886237e64952cc7d93be59b7a142b51ab481',
  REFRESH_TOKEN: '3a113d2432e68e8d1a1ceb5c7527eb80132373b'
};

let cache: RunData[] = [];
let lastUpdate = 0;
const SIX_HOURS = 6 * 60 * 60 * 1000;

// Función para calcular el ritmo en minutos por kilómetro
const calculatePace = (distance: number, time: number): number => {
  const distanceKm = distance / 1000;
  const timeMinutes = time / 60;
  return distanceKm > 0 ? timeMinutes / distanceKm : 0;
};

// Función para obtener ubicación de la actividad
const getLocationFromActivity = (activity: StravaActivity): string => {
  const city = activity.location_city || '';
  const country = activity.location_country || '';
  
  if (city && country) {
    return `${city}, ${country}`;
  }
  
  if (city) return city;
  if (country) return country;
  
  if (activity.name) {
    const nameParts = activity.name.split(' en ');
    if (nameParts.length > 1) {
      return nameParts[1];
    }
    return activity.name;
  }
  
  return 'Sin ubicación registrada';
};

// Función para convertir actividad de Strava al formato RunData
const convertStravaActivityToRunData = (activity: StravaActivity): RunData => {
  const originalStartTime = activity.start_date_local;
  const originalDate = new Date(originalStartTime);
  
  // Aplicar corrección de +6 horas para Costa Rica
  const correctedDate = new Date(originalDate.getTime() + (6 * 60 * 60 * 1000));
  const correctedStartTime = correctedDate.toISOString();
  const correctedDateOnly = correctedStartTime.split('T')[0];
  
  return {
    id: activity.id,
    date: correctedDateOnly,
    distance: activity.distance / 1000, // metros a kilómetros
    duration: Math.round(activity.moving_time / 60), // segundos a minutos
    elevation: Math.round(activity.total_elevation_gain),
    avgPace: calculatePace(activity.distance, activity.moving_time),
    location: getLocationFromActivity(activity),
    startTimeLocal: correctedStartTime
  };
};

// Función mejorada para obtener TODAS las actividades con mejor manejo de errores
const getAllActivities = async (accessToken: string): Promise<StravaActivity[]> => {
  const allActivities: StravaActivity[] = [];
  let page = 1;
  const perPage = 200;
  let hasMoreActivities = true;
  
  console.log('🏃 Iniciando obtención de actividades...');
  console.log('🔑 Token siendo usado:', accessToken.substring(0, 20) + '...');
  
  while (hasMoreActivities && page <= 10) { // Límite de seguridad
    try {
      const url = `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}`;
      
      console.log(`📡 Página ${page}: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        },
      });
      
      console.log(`📊 Respuesta: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Error ${response.status}:`, errorText);
        
        // Parsear el error si es JSON
        try {
          const errorData = JSON.parse(errorText);
          console.error('📋 Detalles del error:', errorData);
          
          if (errorData.errors) {
            for (const error of errorData.errors) {
              if (error.code === 'missing' && error.field === 'activity:read_permission') {
                throw new Error('Token sin permisos de lectura de actividades. Necesita reautorización con scope "read,activity:read_all"');
              }
            }
          }
        } catch (parseError) {
          // Si no es JSON, usar el texto original
        }
        
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      
      const activities: StravaActivity[] = await response.json();
      console.log(`📄 Página ${page}: ${activities.length} actividades`);
      
      if (activities.length === 0) {
        hasMoreActivities = false;
      } else {
        allActivities.push(...activities);
        page++;
      }
    } catch (error) {
      console.error(`❌ Error en página ${page}:`, error);
      throw error; // Re-lanzar el error para que se propague
    }
  }
  
  console.log(`✅ Total actividades obtenidas: ${allActivities.length}`);
  return allActivities;
};

async function refreshStravaData(): Promise<RunData[]> {
  console.log('🔄 Iniciando refresh de datos Strava...');
  console.log('🔧 Configuración actual:', {
    clientId: STRAVA_CONFIG.CLIENT_ID,
    hasAccessToken: !!STRAVA_CONFIG.ACCESS_TOKEN,
    accessTokenStart: STRAVA_CONFIG.ACCESS_TOKEN.substring(0, 10) + '...',
    hasRefreshToken: !!STRAVA_CONFIG.REFRESH_TOKEN,
    hasClientSecret: !!STRAVA_CONFIG.CLIENT_SECRET
  });

  if (!STRAVA_CONFIG.ACCESS_TOKEN || STRAVA_CONFIG.ACCESS_TOKEN === 'your_access_token_here') {
    throw new Error('ACCESS_TOKEN no configurado correctamente');
  }

  let currentAccessToken = STRAVA_CONFIG.ACCESS_TOKEN;
  
  // Intentar refrescar token si es necesario
  if (Date.now() - lastUpdate > SIX_HOURS) {
    console.log('🔑 Intentando refrescar token...');
    
    try {
      const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: STRAVA_CONFIG.CLIENT_ID,
          client_secret: STRAVA_CONFIG.CLIENT_SECRET,
          refresh_token: STRAVA_CONFIG.REFRESH_TOKEN,
          grant_type: 'refresh_token',
        }),
      });

      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        currentAccessToken = tokenData.access_token;
        console.log('✅ Token refrescado exitosamente');
        console.log('🔑 Nuevo token:', currentAccessToken.substring(0, 20) + '...');
      } else {
        const errorText = await tokenResponse.text();
        console.warn('⚠️ No se pudo refrescar token:', errorText);
        console.log('🔄 Continuando con token actual...');
      }
    } catch (error) {
      console.warn('⚠️ Error refrescando token:', error);
      console.log('🔄 Continuando con token actual...');
    }
  }

  // Obtener actividades
  const allActivities = await getAllActivities(currentAccessToken);
  
  // Filtrar carreras
  const runningActivities = allActivities.filter(activity => activity.type === 'Run');
  console.log(`🏃 Actividades de carrera: ${runningActivities.length} de ${allActivities.length} total`);
  
  // Convertir y ordenar
  cache = runningActivities.map(convertStravaActivityToRunData);
  cache.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  lastUpdate = Date.now();
  console.log(`✅ Cache actualizado con ${cache.length} carreras`);
  
  return cache;
}

export const getStravaRuns = async (): Promise<RunData[]> => {
  try {
    console.log('📡 getStravaRuns ejecutándose...');
    
    if (Date.now() - lastUpdate > SIX_HOURS || cache.length === 0) {
      console.log('🔄 Refrescando datos...');
      return await refreshStravaData();
    } else {
      console.log('📁 Usando cache:', cache.length, 'carreras');
      return cache;
    }
  } catch (error) {
    console.error('❌ Error en getStravaRuns:', error);
    throw error;
  }
};


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

// Credenciales de Juan - Hardcodeadas temporalmente para testing
const STRAVA_CONFIG = {
  CLIENT_ID: '160774',
  CLIENT_SECRET: '5836512c42bdd300ac801e4b2d81bdff5228d281', // Este necesita ser actualizado con el valor real
  ACCESS_TOKEN: 'a9dc1c04a421b97598877dc1f5d5a651fcecefae',   // Este necesita ser actualizado con el valor real
  REFRESH_TOKEN: '101890a7d1533723487699325e80ca5848eda091'  // Este necesita ser actualizado con el valor real
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

// Función para obtener TODAS las actividades con paginación
const getAllActivities = async (accessToken: string): Promise<StravaActivity[]> => {
  const allActivities: StravaActivity[] = [];
  let page = 1;
  const perPage = 200; // Máximo permitido por Strava
  let hasMoreActivities = true;
  
  console.log('🏃 Iniciando obtención de TODAS las actividades...');
  
  while (hasMoreActivities) {
    try {
      const url = `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}`;
      
      console.log(`📡 Llamando a Strava API: ${url}`);
      console.log(`🔑 Usando token: ${accessToken.substring(0, 10)}...`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      console.log(`📊 Respuesta de Strava: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Error en Strava API: ${response.status}`, errorText);
        throw new Error(`Error en Strava API: ${response.status}`);
      }
      
      const activities: StravaActivity[] = await response.json();
      
      console.log(`📄 Página ${page}: ${activities.length} actividades obtenidas`);
      
      if (activities.length === 0) {
        hasMoreActivities = false;
      } else {
        allActivities.push(...activities);
        page++;
        
        // Límite de seguridad para evitar bucles infinitos (máximo 50 páginas = 10,000 actividades)
        if (page > 50) {
          console.log('⚠️ Límite de páginas alcanzado (50 páginas)');
          hasMoreActivities = false;
        }
      }
    } catch (error) {
      console.error(`❌ Error obteniendo página ${page}:`, error);
      hasMoreActivities = false;
    }
  }
  
  console.log(`✅ Total de actividades obtenidas: ${allActivities.length}`);
  return allActivities;
};

async function refreshStravaData(): Promise<RunData[]> {
  console.log('🔄 Iniciando refresh de datos Strava...');
  console.log('🔧 Configuración:', {
    clientId: STRAVA_CONFIG.CLIENT_ID,
    hasAccessToken: !!STRAVA_CONFIG.ACCESS_TOKEN,
    hasRefreshToken: !!STRAVA_CONFIG.REFRESH_TOKEN,
    hasClientSecret: !!STRAVA_CONFIG.CLIENT_SECRET
  });

  // 1. Verificar que tenemos las credenciales básicas
  if (!STRAVA_CONFIG.ACCESS_TOKEN || STRAVA_CONFIG.ACCESS_TOKEN === 'your_access_token_here') {
    console.error('❌ ACCESS_TOKEN no configurado');
    throw new Error('Credenciales de Strava no configuradas - necesita actualizar ACCESS_TOKEN');
  }

  // 2. Refrescar token si pasaron 6 horas
  let currentAccessToken = STRAVA_CONFIG.ACCESS_TOKEN;
  
  if (Date.now() - lastUpdate > SIX_HOURS) {
    console.log('🔑 Refrescando token de acceso...');
    
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

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('❌ Error refrescando token:', errorText);
        throw new Error(`Error refrescando token: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();
      currentAccessToken = tokenData.access_token;
      
      console.log('✅ Token refrescado exitosamente');
    } catch (error) {
      console.error('❌ Error refrescando token:', error);
      // Continuar con el token actual
    }
  }

  // 3. Obtener TODAS las actividades
  const allActivities = await getAllActivities(currentAccessToken);
  
  // 4. Filtrar solo las de tipo "Run" y mapear al formato de la aplicación
  const runningActivities = allActivities.filter(activity => activity.type === 'Run');
  console.log(`🏃 Actividades de carrera filtradas: ${runningActivities.length}`);
  
  cache = runningActivities.map(convertStravaActivityToRunData);
  
  // 5. Ordenar por fecha (más reciente primero)
  cache.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  lastUpdate = Date.now();
  console.log(`✅ Cache actualizado con ${cache.length} carreras`);
  
  return cache;
}

export const getStravaRuns = async (): Promise<RunData[]> => {
  try {
    console.log('📡 getStravaRuns llamada');
    
    // Verificar si necesitamos refrescar los datos
    if (Date.now() - lastUpdate > SIX_HOURS || cache.length === 0) {
      console.log('🔄 Necesario refrescar datos...');
      return await refreshStravaData();
    } else {
      console.log('📁 Usando datos en cache');
      return cache;
    }
  } catch (error) {
    console.error('❌ Error en getStravaRuns:', error);
    throw error;
  }
};

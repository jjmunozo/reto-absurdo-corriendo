
import type { Request, Response } from 'express';

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

interface RunData {
  id: number;
  date: string;
  distance: number;
  duration: number;
  elevation: number;
  avgPace: number;
  location: string;
  startTimeLocal: string;
}

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
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (!response.ok) {
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

async function refreshData() {
  const {
    STRAVA_CLIENT_ID,
    STRAVA_CLIENT_SECRET,
    STRAVA_ACCESS_TOKEN,
    STRAVA_REFRESH_TOKEN,
  } = process.env as Record<string, string>;

  console.log('🔄 Iniciando refresh de datos Strava...');

  // 1. Refrescar token si pasaron 6 horas
  let currentAccessToken = STRAVA_ACCESS_TOKEN;
  
  if (Date.now() - lastUpdate > SIX_HOURS) {
    console.log('🔑 Refrescando token de acceso...');
    
    try {
      const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: STRAVA_CLIENT_ID,
          client_secret: STRAVA_CLIENT_SECRET,
          refresh_token: STRAVA_REFRESH_TOKEN,
          grant_type: 'refresh_token',
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Error refrescando token: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();
      currentAccessToken = tokenData.access_token;
      
      // Nota: En un entorno real, aquí actualizarías las variables de entorno
      // pero en este caso simplemente usamos el nuevo token para esta sesión
      console.log('✅ Token refrescado exitosamente');
    } catch (error) {
      console.error('❌ Error refrescando token:', error);
      // Continuar con el token actual
    }
  }

  // 2. Obtener TODAS las actividades
  const allActivities = await getAllActivities(currentAccessToken);
  
  // 3. Filtrar solo las de tipo "Run" y mapear al formato de la aplicación
  const runningActivities = allActivities.filter(activity => activity.type === 'Run');
  console.log(`🏃 Actividades de carrera filtradas: ${runningActivities.length}`);
  
  cache = runningActivities.map(convertStravaActivityToRunData);
  
  // 4. Ordenar por fecha (más reciente primero)
  cache.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  lastUpdate = Date.now();
  console.log(`✅ Cache actualizado con ${cache.length} carreras`);
}

// GET /api/strava - Endpoint principal
export default async (_req: Request, res: Response) => {
  try {
    console.log('📡 API /api/strava llamada');
    
    // Verificar si necesitamos refrescar los datos
    if (Date.now() - lastUpdate > SIX_HOURS || cache.length === 0) {
      console.log('🔄 Necesario refrescar datos...');
      await refreshData();
    } else {
      console.log('📁 Usando datos en cache');
    }
    
    console.log(`📤 Retornando ${cache.length} carreras`);
    return res.json(cache);
  } catch (error) {
    console.error('❌ Error en API Strava:', error);
    return res.status(500).json({ 
      error: 'Error obteniendo datos de Strava',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

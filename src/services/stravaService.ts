
/**
 * Servicio para manejar la comunicación con la API de Strava
 */

// Tipos de datos para la API de Strava
export interface StravaTokenResponse {
  token_type: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  access_token: string;
  athlete: StravaAthlete;
}

export interface StravaAthlete {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  profile: string;  // URL de la imagen de perfil
}

export interface StravaActivity {
  id: number;
  name: string;
  distance: number;            // en metros
  moving_time: number;         // en segundos
  elapsed_time: number;        // en segundos
  total_elevation_gain: number; // en metros
  start_date: string;
  start_date_local: string;
  average_speed: number;       // en metros/segundo
  max_speed: number;           // en metros/segundo
  has_heartrate: boolean;
  average_heartrate?: number;
  max_heartrate?: number;
  type: string;                // Run, Ride, etc.
  workout_type?: number;
  location_city?: string;
  location_country?: string;
  map?: {
    summary_polyline?: string;
    id?: string;
  };
}

// Configuración de la API de Strava
const STRAVA_CLIENT_ID = '160774'; // Tu Client ID de Strava
const STRAVA_CLIENT_SECRET = '5836512c42bdd300ac801e4b2d81bdff5228d281'; // Tu Client Secret de Strava
const STRAVA_REDIRECT_URI = `${window.location.origin}/auth/strava/callback`;

// Nueva URL utilizando https
const STRAVA_AUTH_URL = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${encodeURIComponent(STRAVA_REDIRECT_URI)}&response_type=code&scope=read,activity:read_all`;

// Constantes para localStorage
const TOKEN_STORAGE_KEY = 'strava_tokens';
const ATHLETE_STORAGE_KEY = 'strava_athlete';

/**
 * Inicia el flujo de autorización de Strava redirigiendo al usuario a la página de autenticación
 */
export const initiateStravaAuth = (): void => {
  console.log('Redirigiendo a:', STRAVA_AUTH_URL);
  window.location.href = STRAVA_AUTH_URL;
};

/**
 * Intercambia el código de autorización por tokens de acceso
 */
export const exchangeCodeForToken = async (code: string): Promise<StravaTokenResponse> => {
  try {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new Error(`Error al intercambiar código: ${response.status}`);
    }

    const data: StravaTokenResponse = await response.json();
    
    // Guardar tokens y datos del atleta en localStorage
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
    }));
    
    // Guardar datos del atleta por separado
    localStorage.setItem(ATHLETE_STORAGE_KEY, JSON.stringify(data.athlete));
    
    return data;
  } catch (error) {
    console.error('Error intercambiando código por token:', error);
    throw error;
  }
};

/**
 * Obtiene un token de acceso válido, refrescándolo si es necesario
 */
export const getAccessToken = async (): Promise<string> => {
  const tokensStr = localStorage.getItem(TOKEN_STORAGE_KEY);
  
  if (!tokensStr) {
    throw new Error('No hay tokens almacenados. El usuario debe autenticarse primero.');
  }
  
  const tokens = JSON.parse(tokensStr);
  const now = Math.floor(Date.now() / 1000);
  
  // Si el token ha expirado, refrescarlo
  if (now >= tokens.expires_at) {
    try {
      const response = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: STRAVA_CLIENT_ID,
          client_secret: STRAVA_CLIENT_SECRET,
          refresh_token: tokens.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error(`Error al refrescar token: ${response.status}`);
      }

      const newTokens: StravaTokenResponse = await response.json();
      
      // Actualizar tokens en localStorage
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify({
        access_token: newTokens.access_token,
        refresh_token: newTokens.refresh_token,
        expires_at: newTokens.expires_at,
      }));
      
      return newTokens.access_token;
    } catch (error) {
      console.error('Error refrescando token:', error);
      throw error;
    }
  }
  
  // Si el token aún es válido, devolverlo
  return tokens.access_token;
};

/**
 * Obtiene información del atleta autenticado
 */
export const getAthleteInfo = (): StravaAthlete | null => {
  const athleteData = localStorage.getItem(ATHLETE_STORAGE_KEY);
  return athleteData ? JSON.parse(athleteData) : null;
};

/**
 * Comprueba si el usuario está autenticado con Strava
 */
export const isAuthenticated = (): boolean => {
  return localStorage.getItem(TOKEN_STORAGE_KEY) !== null;
};

/**
 * Cierra la sesión eliminando los tokens almacenados
 */
export const logout = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(ATHLETE_STORAGE_KEY);
};

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
    const accessToken = await getAccessToken();
    
    let url = `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${per_page}`;
    
    if (before) {
      url += `&before=${before}`;
    }
    
    if (after) {
      url += `&after=${after}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error obteniendo actividades: ${response.status}`);
    }

    const activities: StravaActivity[] = await response.json();
    return activities;
  } catch (error) {
    console.error('Error obteniendo actividades del atleta:', error);
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
 * Convierte una actividad de Strava al formato de RunData de nuestra aplicación
 */
export const convertStravaActivityToRunData = (activity: StravaActivity): import('@/data/runningData').RunData => {
  return {
    id: activity.id,
    date: activity.start_date_local.split('T')[0],  // Formato YYYY-MM-DD
    distance: activity.distance / 1000,  // Convertir de metros a kilómetros
    duration: Math.round(activity.moving_time / 60),  // Convertir de segundos a minutos
    elevation: Math.round(activity.total_elevation_gain),  // Metros
    avgPace: calculatePace(activity.distance, activity.moving_time),  // Calcular ritmo en min/km
    location: activity.location_city || 'Desconocido',
  };
};

/**
 * Calcula el ritmo en minutos por kilómetro
 * @param distance Distancia en metros
 * @param time Tiempo en segundos
 * @returns Ritmo en minutos por kilómetro (formato decimal)
 */
const calculatePace = (distance: number, time: number): number => {
  // Convertir distancia a kilómetros
  const distanceKm = distance / 1000;
  
  // Convertir tiempo a minutos
  const timeMinutes = time / 60;
  
  // Calcular minutos por kilómetro
  return distanceKm > 0 ? timeMinutes / distanceKm : 0;
};

/**
 * Obtiene todas las actividades de carrera y las convierte al formato de nuestra aplicación
 */
export const getRunningData = async (): Promise<import('@/data/runningData').RunData[]> => {
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

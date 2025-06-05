
/**
 * Service for perpetual Strava connection using fixed tokens
 */

import { StravaTokenResponse, StravaAthlete } from '@/types/stravaTypes';
import { 
  STRAVA_CLIENT_ID, 
  STRAVA_CLIENT_SECRET,
  TOKEN_STORAGE_KEY,
  ATHLETE_STORAGE_KEY
} from './stravaConfig';

// Token fijo de tu cuenta de Strava (necesitarás reemplazar estos valores)
// Estos son los tokens de tu cuenta personal que permitirán acceso perpetuo
const PERPETUAL_ACCESS_TOKEN = 'your_long_lived_access_token_here';
const PERPETUAL_REFRESH_TOKEN = 'your_refresh_token_here';
const PERPETUAL_EXPIRES_AT = 1893456000; // Una fecha muy lejana en el futuro

// Datos fijos de tu atleta (reemplaza con tus datos reales)
const PERPETUAL_ATHLETE_DATA: StravaAthlete = {
  id: 160774, // Tu ID de atleta
  firstname: "Tu", // Tu nombre
  lastname: "Nombre", // Tu apellido
  profile_medium: "", // URL de tu foto de perfil
  profile: "", // URL de tu foto de perfil grande
  city: "Tu Ciudad", // Tu ciudad
  state: "Tu Estado", // Tu estado/provincia
  country: "Tu País", // Tu país
  sex: "M", // Tu sexo
  premium: false, // Si tienes cuenta premium
  summit: false, // Si tienes Strava Summit
  created_at: "2024-01-01T00:00:00Z", // Fecha de creación de tu cuenta
  updated_at: "2024-01-01T00:00:00Z" // Fecha de última actualización
};

/**
 * Inicializa la conexión perpetua estableciendo los tokens y datos del atleta
 */
export const initializePerpetualConnection = (): void => {
  console.log('🔄 Inicializando conexión perpetua de Strava...');
  
  // Establecer tokens en localStorage
  const tokens = {
    access_token: PERPETUAL_ACCESS_TOKEN,
    refresh_token: PERPETUAL_REFRESH_TOKEN,
    expires_at: PERPETUAL_EXPIRES_AT,
  };
  
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
  localStorage.setItem(ATHLETE_STORAGE_KEY, JSON.stringify(PERPETUAL_ATHLETE_DATA));
  
  console.log('✅ Conexión perpetua inicializada');
};

/**
 * Verifica si la conexión perpetua está activa
 */
export const isPerpetualConnectionActive = (): boolean => {
  const tokens = localStorage.getItem(TOKEN_STORAGE_KEY);
  const athlete = localStorage.getItem(ATHLETE_STORAGE_KEY);
  
  return tokens !== null && athlete !== null;
};

/**
 * Obtiene un token de acceso válido para la conexión perpetua
 */
export const getPerpetualAccessToken = async (): Promise<string> => {
  const tokensStr = localStorage.getItem(TOKEN_STORAGE_KEY);
  
  if (!tokensStr) {
    // Si no hay tokens, inicializar la conexión perpetua
    initializePerpetualConnection();
    return PERPETUAL_ACCESS_TOKEN;
  }
  
  const tokens = JSON.parse(tokensStr);
  const now = Math.floor(Date.now() / 1000);
  
  // Si el token ha expirado, intentar refrescarlo
  if (now >= tokens.expires_at && tokens.refresh_token !== PERPETUAL_REFRESH_TOKEN) {
    try {
      console.log('🔄 Refrescando token perpetuo...');
      
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
        console.warn('⚠️ Error refrescando token, usando token fijo');
        return PERPETUAL_ACCESS_TOKEN;
      }

      const newTokens: StravaTokenResponse = await response.json();
      
      // Actualizar tokens en localStorage
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify({
        access_token: newTokens.access_token,
        refresh_token: newTokens.refresh_token,
        expires_at: newTokens.expires_at,
      }));
      
      console.log('✅ Token perpetuo refrescado');
      return newTokens.access_token;
    } catch (error) {
      console.warn('⚠️ Error refrescando token perpetuo, usando token fijo:', error);
      return PERPETUAL_ACCESS_TOKEN;
    }
  }
  
  return tokens.access_token;
};

/**
 * Obtiene información del atleta para la conexión perpetua
 */
export const getPerpetualAthleteInfo = (): StravaAthlete => {
  const athleteData = localStorage.getItem(ATHLETE_STORAGE_KEY);
  
  if (!athleteData) {
    // Si no hay datos del atleta, inicializar conexión perpetua
    initializePerpetualConnection();
    return PERPETUAL_ATHLETE_DATA;
  }
  
  return JSON.parse(athleteData);
};

/**
 * Fuerza la inicialización de la conexión perpetua
 */
export const forcePerpetualConnection = (): void => {
  console.log('🔄 Forzando conexión perpetua...');
  initializePerpetualConnection();
};

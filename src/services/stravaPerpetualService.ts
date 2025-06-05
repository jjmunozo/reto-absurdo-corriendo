
/**
 * Service for perpetual Strava connection using real captured tokens
 */

import { StravaTokenResponse, StravaAthlete } from '@/types/stravaTypes';
import { 
  STRAVA_CLIENT_ID, 
  STRAVA_CLIENT_SECRET,
  TOKEN_STORAGE_KEY,
  ATHLETE_STORAGE_KEY
} from './stravaConfig';
import {
  getRealAccessToken,
  getRealRefreshToken,
  getRealAthleteData,
  hasRealDataCaptured
} from './stravaRealDataCapture';

// Fallback data if no real data is available (will be replaced with real data)
const FALLBACK_ATHLETE_DATA: StravaAthlete = {
  id: 160774,
  firstname: "Juan J.",
  lastname: "Muñoz",
  profile_medium: "",
  profile: "",
  city: "San José",
  state: "San José",
  country: "Costa Rica",
  sex: "M",
  premium: false,
  summit: false,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z"
};

/**
 * Inicializa la conexión perpetua usando datos reales si están disponibles
 */
export const initializePerpetualConnection = (): void => {
  console.log('🔄 Inicializando conexión perpetua de Strava...');
  
  // Check if we have real captured data
  if (hasRealDataCaptured()) {
    console.log('✅ Usando datos reales capturados');
    
    const realToken = getRealAccessToken();
    const realRefreshToken = getRealRefreshToken();
    const realAthlete = getRealAthleteData();
    
    if (realToken && realRefreshToken && realAthlete) {
      // Use real captured data
      const tokens = {
        access_token: realToken,
        refresh_token: realRefreshToken,
        expires_at: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year from now
      };
      
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
      localStorage.setItem(ATHLETE_STORAGE_KEY, JSON.stringify(realAthlete));
      
      console.log('✅ Conexión perpetua inicializada con datos reales de:', 
        `${realAthlete.firstname} ${realAthlete.lastname}`);
      return;
    }
  }
  
  // Fallback to default data if no real data available
  console.log('⚠️ Usando datos de fallback - se necesitan datos reales');
  const fallbackTokens = {
    access_token: 'fallback_token_needs_real_data',
    refresh_token: 'fallback_refresh_needs_real_data',
    expires_at: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60),
  };
  
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(fallbackTokens));
  localStorage.setItem(ATHLETE_STORAGE_KEY, JSON.stringify(FALLBACK_ATHLETE_DATA));
  
  console.log('✅ Conexión perpetua inicializada con datos de fallback');
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
    initializePerpetualConnection();
    const newTokensStr = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (newTokensStr) {
      const tokens = JSON.parse(newTokensStr);
      return tokens.access_token;
    }
    return 'fallback_token';
  }
  
  const tokens = JSON.parse(tokensStr);
  const now = Math.floor(Date.now() / 1000);
  
  // Si el token ha expirado, intentar refrescarlo solo si tenemos datos reales
  if (now >= tokens.expires_at && hasRealDataCaptured()) {
    try {
      console.log('🔄 Refrescando token perpetuo con datos reales...');
      
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
        console.warn('⚠️ Error refrescando token, usando token actual');
        return tokens.access_token;
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
      console.warn('⚠️ Error refrescando token perpetuo:', error);
      return tokens.access_token;
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
    initializePerpetualConnection();
    const newAthleteData = localStorage.getItem(ATHLETE_STORAGE_KEY);
    if (newAthleteData) {
      return JSON.parse(newAthleteData);
    }
    return FALLBACK_ATHLETE_DATA;
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

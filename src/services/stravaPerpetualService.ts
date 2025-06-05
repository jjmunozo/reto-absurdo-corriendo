
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
    
    console.log('🔍 Datos reales disponibles:', {
      hasToken: !!realToken,
      hasRefreshToken: !!realRefreshToken,
      hasAthlete: !!realAthlete,
      athleteName: realAthlete ? `${realAthlete.firstname} ${realAthlete.lastname}` : 'N/A'
    });
    
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
      
      // Marcar que estamos usando datos reales
      localStorage.setItem('using_real_data', 'true');
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
  localStorage.setItem('using_real_data', 'false');
  
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
 * Verifica si estamos usando datos reales
 */
export const isUsingRealData = (): boolean => {
  return localStorage.getItem('using_real_data') === 'true' && hasRealDataCaptured();
};

/**
 * Obtiene un token de acceso válido para la conexión perpetua
 */
export const getPerpetualAccessToken = async (): Promise<string> => {
  console.log('🔑 getPerpetualAccessToken: Iniciando...');
  
  // Si tenemos datos reales, usar esos tokens directamente (PRIORIDAD MÁXIMA)
  if (hasRealDataCaptured()) {
    const realToken = getRealAccessToken();
    if (realToken) {
      console.log('🔑 Usando token real capturado:', realToken.substring(0, 10) + '...');
      return realToken;
    }
  }
  
  console.log('⚠️ No hay token real disponible, usando fallback');
  const tokensStr = localStorage.getItem(TOKEN_STORAGE_KEY);
  
  if (!tokensStr) {
    console.log('🔄 No hay tokens en localStorage, inicializando conexión perpetua...');
    initializePerpetualConnection();
    const newTokensStr = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (newTokensStr) {
      const tokens = JSON.parse(newTokensStr);
      return tokens.access_token;
    }
    return 'fallback_token';
  }
  
  const tokens = JSON.parse(tokensStr);
  return tokens.access_token;
};

/**
 * Obtiene información del atleta para la conexión perpetua
 */
export const getPerpetualAthleteInfo = (): StravaAthlete => {
  console.log('👤 getPerpetualAthleteInfo: Iniciando...');
  
  // Si tenemos datos reales, usar esos datos directamente (PRIORIDAD MÁXIMA)
  if (hasRealDataCaptured()) {
    const realAthlete = getRealAthleteData();
    if (realAthlete) {
      console.log('👤 Usando datos reales del atleta:', realAthlete.firstname, realAthlete.lastname);
      return realAthlete;
    }
  }
  
  console.log('⚠️ No hay datos reales del atleta, usando fallback');
  const athleteData = localStorage.getItem(ATHLETE_STORAGE_KEY);
  
  if (!athleteData) {
    console.log('🔄 No hay datos del atleta en localStorage, inicializando conexión perpetua...');
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

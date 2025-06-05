
/**
 * Service for capturing real Strava data from admin connection
 */

import { StravaAthlete } from '@/types/stravaTypes';
import { 
  TOKEN_STORAGE_KEY, 
  ATHLETE_STORAGE_KEY 
} from './stravaConfig';

// Keys for storing real captured data
const REAL_TOKEN_KEY = 'strava_real_tokens';
const REAL_ATHLETE_KEY = 'strava_real_athlete';

/**
 * Captures real tokens and athlete data from current localStorage
 * Call this after connecting to Strava in admin mode
 */
export const captureRealStravaData = (): boolean => {
  try {
    console.log('🔍 Capturando datos reales de Strava...');
    
    // Get current tokens from localStorage
    const currentTokens = localStorage.getItem(TOKEN_STORAGE_KEY);
    const currentAthlete = localStorage.getItem(ATHLETE_STORAGE_KEY);
    
    if (!currentTokens || !currentAthlete) {
      console.error('❌ No hay datos de Strava en localStorage para capturar');
      return false;
    }
    
    // Parse and validate data
    const tokens = JSON.parse(currentTokens);
    const athlete = JSON.parse(currentAthlete);
    
    if (!tokens.access_token || !tokens.refresh_token || !athlete.id) {
      console.error('❌ Datos de Strava incompletos');
      return false;
    }
    
    // Store as real data
    localStorage.setItem(REAL_TOKEN_KEY, currentTokens);
    localStorage.setItem(REAL_ATHLETE_KEY, currentAthlete);
    
    console.log('✅ Datos reales capturados:', {
      athleteId: athlete.id,
      athleteName: `${athlete.firstname} ${athlete.lastname}`,
      hasTokens: !!tokens.access_token
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error capturando datos reales:', error);
    return false;
  }
};

/**
 * Gets the real captured access token
 */
export const getRealAccessToken = (): string | null => {
  try {
    const realTokens = localStorage.getItem(REAL_TOKEN_KEY);
    if (!realTokens) return null;
    
    const tokens = JSON.parse(realTokens);
    return tokens.access_token || null;
  } catch (error) {
    console.error('Error obteniendo token real:', error);
    return null;
  }
};

/**
 * Gets the real captured refresh token
 */
export const getRealRefreshToken = (): string | null => {
  try {
    const realTokens = localStorage.getItem(REAL_TOKEN_KEY);
    if (!realTokens) return null;
    
    const tokens = JSON.parse(realTokens);
    return tokens.refresh_token || null;
  } catch (error) {
    console.error('Error obteniendo refresh token real:', error);
    return null;
  }
};

/**
 * Gets the real captured athlete data
 */
export const getRealAthleteData = (): StravaAthlete | null => {
  try {
    const realAthlete = localStorage.getItem(REAL_ATHLETE_KEY);
    if (!realAthlete) return null;
    
    return JSON.parse(realAthlete);
  } catch (error) {
    console.error('Error obteniendo datos reales del atleta:', error);
    return null;
  }
};

/**
 * Checks if we have real data captured
 */
export const hasRealDataCaptured = (): boolean => {
  const tokens = localStorage.getItem(REAL_TOKEN_KEY);
  const athlete = localStorage.getItem(REAL_ATHLETE_KEY);
  return tokens !== null && athlete !== null;
};

/**
 * Displays current real data for verification
 */
export const displayRealData = (): void => {
  const athlete = getRealAthleteData();
  const hasTokens = getRealAccessToken() !== null;
  
  if (athlete && hasTokens) {
    console.log('📊 Datos reales capturados:', {
      id: athlete.id,
      nombre: `${athlete.firstname} ${athlete.lastname}`,
      ciudad: athlete.city,
      país: athlete.country,
      tieneTokens: hasTokens
    });
  } else {
    console.log('❌ No hay datos reales capturados');
  }
};

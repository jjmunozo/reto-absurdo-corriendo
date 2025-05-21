
/**
 * Service for handling Strava authentication
 */

import { StravaTokenResponse, StravaAthlete } from '@/types/stravaTypes';
import { 
  STRAVA_AUTH_URL, 
  STRAVA_CLIENT_ID, 
  STRAVA_CLIENT_SECRET,
  TOKEN_STORAGE_KEY,
  ATHLETE_STORAGE_KEY
} from './stravaConfig';

/**
 * Inicia el flujo de autorización de Strava redirigiendo al usuario a la página de autenticación
 */
export const initiateStravaAuth = (): void => {
  // Registrar información de depuración
  console.log('Dominio actual:', window.location.origin);
  console.log('URI de redirección completa:', `${window.location.origin}/auth/strava/callback`);
  console.log('URL de autenticación de Strava:', STRAVA_AUTH_URL);
  
  // Redirigir al usuario a la página de autenticación de Strava
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

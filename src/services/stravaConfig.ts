
/**
 * Configuration for Strava API
 */

// Configuración de la API de Strava
export const STRAVA_CLIENT_ID = '160774'; // Tu Client ID de Strava
export const STRAVA_CLIENT_SECRET = '5836512c42bdd300ac801e4b2d81bdff5228d281'; // Tu Client Secret de Strava
export const STRAVA_REDIRECT_URI = `${window.location.origin}/auth/strava/callback`;

// URL de autenticación de Strava
export const STRAVA_AUTH_URL = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${encodeURIComponent(STRAVA_REDIRECT_URI)}&response_type=code&scope=read,activity:read_all`;

// Constantes para localStorage
export const TOKEN_STORAGE_KEY = 'strava_tokens';
export const ATHLETE_STORAGE_KEY = 'strava_athlete';

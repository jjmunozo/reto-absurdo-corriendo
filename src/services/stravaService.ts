
/**
 * Main export file for Strava services with perpetual connection support
 */

// Re-export everything from the separate modules
export * from '@/types/stravaTypes';
export * from './stravaAuthService';
export * from './stravaActivitiesService';
export * from './stravaUtils';
export * from './dataExportService';
export * from './stravaPerpetualService';

// Override some functions to use perpetual connection
import { 
  initializePerpetualConnection,
  isPerpetualConnectionActive,
  getPerpetualAccessToken,
  getPerpetualAthleteInfo,
  forcePerpetualConnection
} from './stravaPerpetualService';
import { isAdminMode } from './dataExportService';
import * as stravaAuthService from './stravaAuthService';

/**
 * Versión mejorada de isAuthenticated que siempre retorna true para conexión perpetua
 */
export const isAuthenticated = (): boolean => {
  // En modo no-admin, siempre consideramos que estamos autenticados
  if (!isAdminMode()) {
    // Asegurar que la conexión perpetua esté inicializada
    if (!isPerpetualConnectionActive()) {
      initializePerpetualConnection();
    }
    return true;
  }
  
  // En modo admin, usar la lógica original
  return stravaAuthService.isAuthenticated();
};

/**
 * Versión mejorada de getAthleteInfo que usa datos perpetuos
 */
export const getAthleteInfo = () => {
  // En modo no-admin, usar datos perpetuos
  if (!isAdminMode()) {
    if (!isPerpetualConnectionActive()) {
      initializePerpetualConnection();
    }
    return getPerpetualAthleteInfo();
  }
  
  // En modo admin, usar la lógica original
  return stravaAuthService.getAthleteInfo();
};

/**
 * Versión mejorada de getAccessToken que usa token perpetuo
 */
export const getAccessToken = async (): Promise<string> => {
  // En modo no-admin, usar token perpetuo
  if (!isAdminMode()) {
    if (!isPerpetualConnectionActive()) {
      initializePerpetualConnection();
    }
    return await getPerpetualAccessToken();
  }
  
  // En modo admin, usar la lógica original
  return await stravaAuthService.getAccessToken();
};

// Re-export función específica para forzar conexión perpetua
export { forcePerpetualConnection };

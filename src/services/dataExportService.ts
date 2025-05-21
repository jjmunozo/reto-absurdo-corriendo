
import { getAllRunningActivities } from './stravaActivitiesService';
import { getAccessToken, isAuthenticated } from './stravaAuthService';
import { convertStravaActivityToRunData } from './stravaUtils';
import { RunData } from '@/data/runningData';

// Key for storing last update timestamp
export const LAST_UPDATE_KEY = 'strava_last_update';
export const UPDATE_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
export const ADMIN_MODE_KEY = 'strava_admin_mode';

/**
 * Check if admin mode is enabled
 */
export const isAdminMode = (): boolean => {
  return localStorage.getItem(ADMIN_MODE_KEY) === 'true';
};

/**
 * Set admin mode
 */
export const setAdminMode = (value: boolean): void => {
  localStorage.setItem(ADMIN_MODE_KEY, value ? 'true' : 'false');
};

/**
 * Obtiene la marca de tiempo de la última actualización
 */
export const getLastUpdateTime = (): number => {
  const timestamp = localStorage.getItem(LAST_UPDATE_KEY);
  return timestamp ? parseInt(timestamp, 10) : 0;
};

/**
 * Establece la marca de tiempo de la última actualización
 */
export const setLastUpdateTime = (timestamp: number): void => {
  localStorage.setItem(LAST_UPDATE_KEY, timestamp.toString());
};

/**
 * Verifica si es necesario actualizar los datos (6 horas o más desde la última actualización)
 */
export const shouldUpdateData = (): boolean => {
  const lastUpdate = getLastUpdateTime();
  const now = Date.now();
  return now - lastUpdate >= UPDATE_INTERVAL;
};

/**
 * Exporta los datos de carreras a un archivo JSON en la carpeta public
 */
export const exportRunningData = async (): Promise<RunData[]> => {
  try {
    if (!isAuthenticated()) {
      console.error('No hay autenticación con Strava');
      return [];
    }
    
    // Intentar obtener actividades de Strava
    const activities = await getAllRunningActivities();
    
    // Convertir actividades al formato de la aplicación
    const runningData = activities.map(convertStravaActivityToRunData);
    
    // Guardar datos en un archivo JSON usando la API fetch
    await saveRunningDataToJson(runningData);
    
    // Actualizar timestamp de última actualización
    setLastUpdateTime(Date.now());
    
    return runningData;
  } catch (error) {
    console.error('Error exportando datos de carreras:', error);
    return [];
  }
};

/**
 * Guarda los datos en un archivo JSON usando la API fetch
 */
const saveRunningDataToJson = async (data: RunData[]): Promise<void> => {
  const jsonData = JSON.stringify(data, null, 2);
  
  // En un entorno real necesitaríamos una API de backend para guardar el archivo
  // Para esta implementación, simularemos que el archivo se guarda correctamente
  // y lo almacenaremos en localStorage
  localStorage.setItem('cached_running_data', jsonData);
  console.log('Datos guardados en localStorage como simulación');
};

/**
 * Carga los datos del archivo JSON
 */
export const loadRunningDataFromJson = (): RunData[] => {
  try {
    const jsonData = localStorage.getItem('cached_running_data');
    if (!jsonData) {
      return [];
    }
    
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Error cargando datos del JSON:', error);
    return [];
  }
};

/**
 * Configura el actualizador automático
 */
let updateInterval: number | null = null;

export const setupAutoUpdater = (): void => {
  // Limpiar intervalo existente si hay uno
  if (updateInterval !== null) {
    clearInterval(updateInterval);
  }
  
  // Configurar nuevo intervalo
  updateInterval = window.setInterval(async () => {
    if (shouldUpdateData() && isAuthenticated()) {
      console.log('Actualizando datos automáticamente...');
      await exportRunningData();
    }
  }, 60000); // Verificar cada minuto (para pruebas, en producción podría ser más espaciado)
};

export const stopAutoUpdater = (): void => {
  if (updateInterval !== null) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
};

/**
 * Formatea la fecha de última actualización
 */
export const formatLastUpdateTime = (): string => {
  const timestamp = getLastUpdateTime();
  if (timestamp === 0) {
    return 'Nunca';
  }
  
  return new Date(timestamp).toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};


/**
 * Utility functions for Strava services
 */

import { RunData } from '@/data/runningData';
import { StravaActivity } from '@/types/stravaTypes';

/**
 * Calcula el ritmo en minutos por kilómetro
 * @param distance Distancia en metros
 * @param time Tiempo en segundos
 * @returns Ritmo en minutos por kilómetro (formato decimal)
 */
export const calculatePace = (distance: number, time: number): number => {
  // Convertir distancia a kilómetros
  const distanceKm = distance / 1000;
  
  // Convertir tiempo a minutos
  const timeMinutes = time / 60;
  
  // Calcular minutos por kilómetro
  return distanceKm > 0 ? timeMinutes / distanceKm : 0;
};

/**
 * Convierte una actividad de Strava al formato de RunData de nuestra aplicación
 */
export const convertStravaActivityToRunData = (activity: StravaActivity): RunData => {
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

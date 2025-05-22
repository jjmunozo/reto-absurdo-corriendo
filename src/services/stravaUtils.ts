
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
 * Genera una descripción de ubicación a partir de los datos de Strava
 */
export const getLocationFromActivity = (activity: StravaActivity): string => {
  const city = activity.location_city || '';
  const country = activity.location_country || '';
  
  // Si tenemos ciudad y país, mostrarlos juntos
  if (city && country) {
    return `${city}, ${country}`;
  }
  
  // Si solo tenemos uno de ellos
  if (city) return city;
  if (country) return country;
  
  // Si no hay datos de ubicación pero hay nombre de actividad
  // Intentar extraer ubicación del nombre (común en actividades de Strava)
  if (activity.name) {
    // Intentamos quitar el prefijo común "Carrera matutina" o similar
    const nameParts = activity.name.split(' en ');
    if (nameParts.length > 1) {
      return nameParts[1]; // Parte después de "en" suele ser la ubicación
    }
    
    // Si no tiene el formato "X en Y", devolver el nombre completo
    return activity.name;
  }
  
  // Si no hay información de ubicación
  return 'Sin ubicación registrada';
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
    location: getLocationFromActivity(activity),
    startTimeLocal: activity.start_date_local  // Guardar la fecha-hora completa
  };
};

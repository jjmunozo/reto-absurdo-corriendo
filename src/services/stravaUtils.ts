
/**
 * Utility functions for Strava services
 */

import { RunData } from '@/data/runningData';
import { StravaActivity } from '@/types/stravaTypes';
import { toZonedTime, format } from 'date-fns-tz';

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
 * Corrigiendo la diferencia de 6 horas en la zona horaria de Strava
 */
export const convertStravaActivityToRunData = (activity: StravaActivity): RunData => {
  // La zona horaria de Costa Rica es UTC-6
  const costaRicaTimeZone = 'America/Costa_Rica';
  
  // El campo start_date_local de Strava parece tener un problema con la zona horaria
  // Parece estar 6 horas atrás del horario real en Costa Rica
  const originalStartTime = activity.start_date_local;
  
  // Crear un objeto Date a partir del string de fecha de Strava
  const originalDate = new Date(originalStartTime);
  
  // Aplicar la corrección de +6 horas para ajustar al tiempo real de Costa Rica
  const correctedDate = new Date(originalDate.getTime() + (6 * 60 * 60 * 1000));
  
  // Convertir a la zona horaria de Costa Rica para asegurarnos de que se maneja correctamente
  // Esto es especialmente importante durante cambios de DST
  const correctedZonedDate = toZonedTime(correctedDate, costaRicaTimeZone);
  
  // Formatear a ISO string para mantener consistencia
  const correctedStartTime = correctedZonedDate.toISOString();
  
  // Extraer solo la parte de fecha (YYYY-MM-DD)
  const correctedDateOnly = correctedStartTime.split('T')[0];
  
  // Log para debugging
  console.log(`Converting activity ${activity.id}:
    Original Strava time: ${originalStartTime}
    Corrected time: ${correctedStartTime}
    Date used: ${correctedDateOnly}`);
  
  return {
    id: activity.id,
    date: correctedDateOnly,  // Usamos la fecha corregida
    distance: activity.distance / 1000,  // Convertir de metros a kilómetros
    duration: Math.round(activity.moving_time / 60),  // Convertir de segundos a minutos
    elevation: Math.round(activity.total_elevation_gain),  // Metros
    avgPace: calculatePace(activity.distance, activity.moving_time),  // Calcular ritmo en min/km
    location: getLocationFromActivity(activity),
    startTimeLocal: correctedStartTime  // Guardar el tiempo corregido
  };
};


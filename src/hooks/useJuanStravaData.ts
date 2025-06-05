
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { RunData } from '@/data/runningData'

export const useJuanStravaData = () => {
  const [activities, setActivities] = useState<RunData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Cargar actividades desde la base de datos (datos públicos de Juan)
  useEffect(() => {
    loadActivities()
    // Auto-refresh cada 30 minutos en el frontend
    const interval = setInterval(loadActivities, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const loadActivities = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('strava_activities')
        .select('*')
        .eq('type', 'Run')
        .order('start_date_local', { ascending: false })

      if (fetchError) {
        console.error('Error loading activities:', fetchError)
        setError('Error al cargar las actividades')
        return
      }

      // Convertir al formato RunData
      const runData: RunData[] = data.map(activity => {
        const originalDate = new Date(activity.start_date_local)
        const correctedDate = new Date(originalDate.getTime() + (6 * 60 * 60 * 1000))
        
        return {
          id: activity.id,
          date: correctedDate.toISOString().split('T')[0],
          distance: activity.distance / 1000, // metros a kilómetros
          duration: Math.round(activity.moving_time / 60), // segundos a minutos
          elevation: Math.round(activity.total_elevation_gain),
          avgPace: calculatePace(activity.distance, activity.moving_time),
          location: getLocationFromActivity(activity),
          startTimeLocal: correctedDate.toISOString()
        }
      })

      setActivities(runData)
      setLastSync(new Date())
    } catch (error) {
      console.error('Error loading activities:', error)
      setError('Error al cargar las actividades')
    } finally {
      setIsLoading(false)
    }
  }

  const syncActivities = async () => {
    setIsSyncing(true)
    setError(null)

    try {
      const { data, error } = await supabase.functions.invoke('sync-strava-activities')

      if (error) {
        throw error
      }

      if (data.error) {
        throw new Error(data.error)
      }

      // Recargar actividades después de la sincronización
      await loadActivities()
      
      return data
    } catch (error: any) {
      console.error('Error syncing activities:', error)
      setError(error.message || 'Error al sincronizar actividades')
      throw error
    } finally {
      setIsSyncing(false)
    }
  }

  const calculatePace = (distance: number, time: number): number => {
    const distanceKm = distance / 1000
    const timeMinutes = time / 60
    return distanceKm > 0 ? timeMinutes / distanceKm : 0
  }

  const getLocationFromActivity = (activity: any): string => {
    const city = activity.location_city || ''
    const country = activity.location_country || ''
    
    if (city && country) {
      return `${city}, ${country}`
    }
    
    if (city) return city
    if (country) return country
    
    if (activity.name) {
      const nameParts = activity.name.split(' en ')
      if (nameParts.length > 1) {
        return nameParts[1]
      }
      return activity.name
    }
    
    return 'Sin ubicación registrada'
  }

  return {
    activities,
    isLoading,
    isSyncing,
    lastSync,
    error,
    syncActivities,
    refreshActivities: loadActivities,
  }
}

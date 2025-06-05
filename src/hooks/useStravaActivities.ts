
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'
import { RunData } from '@/data/runningData'

export const useStravaActivities = () => {
  const { user, session } = useAuth()
  const [activities, setActivities] = useState<RunData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  // Cargar actividades desde la base de datos
  useEffect(() => {
    if (user) {
      loadActivities()
    } else {
      setActivities([])
      setIsLoading(false)
    }
  }, [user])

  const loadActivities = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      
      const { data, error } = await supabase
        .from('strava_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'Run')
        .order('start_date_local', { ascending: false })

      if (error) {
        console.error('Error loading activities:', error)
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
    } finally {
      setIsLoading(false)
    }
  }

  const syncActivities = async () => {
    if (!user || !session) {
      throw new Error('User must be logged in')
    }

    setIsSyncing(true)

    try {
      const { data, error } = await supabase.functions.invoke('sync-strava-activities', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (error) {
        throw error
      }

      if (data.error) {
        throw new Error(data.error)
      }

      // Recargar actividades después de la sincronización
      await loadActivities()
      
      return data
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
    syncActivities,
    refreshActivities: loadActivities,
  }
}

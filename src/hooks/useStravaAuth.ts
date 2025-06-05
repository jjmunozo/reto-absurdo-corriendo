
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'

interface StravaConnection {
  id: string
  strava_athlete_id: number
  athlete_data: any
  created_at: string
}

export const useStravaAuth = () => {
  const { user, session } = useAuth()
  const [stravaConnection, setStravaConnection] = useState<StravaConnection | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Cargar conexión existente
  useEffect(() => {
    if (user) {
      loadStravaConnection()
    } else {
      setStravaConnection(null)
      setIsLoading(false)
    }
  }, [user])

  const loadStravaConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('strava_connections')
        .select('id, strava_athlete_id, athlete_data, created_at')
        .eq('user_id', user!.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading Strava connection:', error)
      } else {
        setStravaConnection(data)
      }
    } catch (error) {
      console.error('Error loading Strava connection:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const initiateStravaAuth = () => {
    if (!user) {
      console.error('User must be logged in to connect Strava')
      return
    }

    // Generar URL de autorización de Strava
    const clientId = '160774' // Tu client ID actual
    const redirectUri = `${window.location.origin}/auth/strava/callback`
    const scope = 'read,activity:read_all'
    const state = user.id // Usamos el user ID como state para seguridad

    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`
    
    window.location.href = authUrl
  }

  const exchangeCodeForToken = async (code: string, state: string) => {
    if (!user || !session) {
      throw new Error('User must be logged in')
    }

    if (state !== user.id) {
      throw new Error('Invalid state parameter')
    }

    setIsConnecting(true)

    try {
      const { data, error } = await supabase.functions.invoke('strava-auth', {
        body: { code, state },
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

      // Recargar conexión después del éxito
      await loadStravaConnection()
      
      return data
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectStrava = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('strava_connections')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      setStravaConnection(null)
    } catch (error) {
      console.error('Error disconnecting Strava:', error)
      throw error
    }
  }

  return {
    stravaConnection,
    isConnected: !!stravaConnection,
    isConnecting,
    isLoading,
    initiateStravaAuth,
    exchangeCodeForToken,
    disconnectStrava,
  }
}

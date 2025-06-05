
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StravaActivity {
  id: number
  name: string
  distance: number
  moving_time: number
  total_elevation_gain: number
  start_date_local: string
  type: string
  location_city?: string
  location_country?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar autenticación
    const authorization = req.headers.get('Authorization')
    if (!authorization) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authorization.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Invalid token')
    }

    console.log(`Syncing activities for user: ${user.id}`)

    // Obtener conexión de Strava del usuario
    const { data: connection, error: connectionError } = await supabase
      .from('strava_connections')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (connectionError || !connection) {
      throw new Error('No Strava connection found')
    }

    // Verificar si el token ha expirado y refrescarlo si es necesario
    let accessToken = connection.access_token
    const expiresAt = new Date(connection.expires_at)
    const now = new Date()

    if (now >= expiresAt) {
      console.log('Token expired, refreshing...')
      
      const refreshResponse = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: Deno.env.get('STRAVA_CLIENT_ID'),
          client_secret: Deno.env.get('STRAVA_CLIENT_SECRET'),
          refresh_token: connection.refresh_token,
          grant_type: 'refresh_token',
        }),
      })

      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh Strava token')
      }

      const refreshData = await refreshResponse.json()
      accessToken = refreshData.access_token

      // Actualizar token en base de datos
      await supabase
        .from('strava_connections')
        .update({
          access_token: refreshData.access_token,
          refresh_token: refreshData.refresh_token,
          expires_at: new Date(refreshData.expires_at * 1000).toISOString(),
        })
        .eq('user_id', user.id)

      console.log('Token refreshed successfully')
    }

    // Obtener actividades de Strava
    console.log('Fetching activities from Strava...')
    let page = 1
    let allActivities: StravaActivity[] = []
    let hasMoreActivities = true

    while (hasMoreActivities && page <= 10) { // Límite de seguridad
      const activitiesResponse = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=200`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      )

      if (!activitiesResponse.ok) {
        throw new Error(`Failed to fetch activities: ${activitiesResponse.status}`)
      }

      const activities: StravaActivity[] = await activitiesResponse.json()
      
      if (activities.length === 0) {
        hasMoreActivities = false
      } else {
        allActivities.push(...activities)
        page++
      }
    }

    console.log(`Fetched ${allActivities.length} total activities`)

    // Filtrar solo carreras y preparar para inserción
    const runningActivities = allActivities
      .filter(activity => activity.type === 'Run')
      .map(activity => ({
        id: activity.id,
        user_id: user.id,
        name: activity.name,
        distance: activity.distance,
        moving_time: activity.moving_time,
        total_elevation_gain: activity.total_elevation_gain,
        start_date_local: activity.start_date_local,
        type: activity.type,
        location_city: activity.location_city,
        location_country: activity.location_country,
        activity_data: activity,
      }))

    console.log(`Processing ${runningActivities.length} running activities`)

    // Usar upsert para insertar/actualizar actividades
    if (runningActivities.length > 0) {
      const { error: insertError } = await supabase
        .from('strava_activities')
        .upsert(runningActivities, { onConflict: 'id' })

      if (insertError) {
        console.error('Error inserting activities:', insertError)
        throw new Error('Failed to save activities')
      }
    }

    console.log('Activities synced successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        activities_synced: runningActivities.length,
        total_activities: allActivities.length
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in sync-strava-activities function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

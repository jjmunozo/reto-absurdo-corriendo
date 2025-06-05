
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

    // Usar las credenciales fijas de Juan
    const juanAccessToken = Deno.env.get('JUAN_STRAVA_ACCESS_TOKEN')!
    const juanRefreshToken = Deno.env.get('JUAN_STRAVA_REFRESH_TOKEN')!
    const juanAthleteId = Deno.env.get('JUAN_STRAVA_ATHLETE_ID')!
    const stravaClientId = Deno.env.get('STRAVA_CLIENT_ID') || '160774'
    const stravaClientSecret = Deno.env.get('STRAVA_CLIENT_SECRET')!

    console.log(`Syncing activities for Juan (athlete ID: ${juanAthleteId})`)

    // Verificar si el token ha expirado y refrescarlo si es necesario
    let accessToken = juanAccessToken
    let refreshToken = juanRefreshToken

    // Intentar refrescar el token proactivamente
    console.log('Refreshing token proactively...')
    
    const refreshResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: stravaClientId,
        client_secret: stravaClientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (refreshResponse.ok) {
      const refreshData = await refreshResponse.json()
      accessToken = refreshData.access_token
      refreshToken = refreshData.refresh_token
      console.log('Token refreshed successfully')
    } else {
      console.log('Using existing token (refresh failed or not needed)')
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
        user_id: juanAthleteId, // Usar el athlete ID de Juan como user_id
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

    // Guardar/actualizar información de conexión de Juan
    const connectionData = {
      user_id: juanAthleteId,
      strava_athlete_id: parseInt(juanAthleteId),
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 horas
      athlete_data: { firstname: 'Juan', lastname: 'Running Data' },
      scope: 'read,activity:read_all'
    }

    const { error: connectionError } = await supabase
      .from('strava_connections')
      .upsert(connectionData, { onConflict: 'user_id' })

    if (connectionError) {
      console.error('Error updating connection:', connectionError)
    }

    console.log('Activities synced successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        activities_synced: runningActivities.length,
        total_activities: allActivities.length,
        athlete_id: juanAthleteId
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

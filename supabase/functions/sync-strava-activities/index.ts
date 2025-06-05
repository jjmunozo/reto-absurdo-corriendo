
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

    // Obtener credenciales de los secrets configurados
    const stravaClientId = '160774'
    const stravaClientSecret = Deno.env.get('STRAVA_CLIENT_SECRET')
    const juanAccessToken = Deno.env.get('JUAN_STRAVA_ACCESS_TOKEN')
    const juanRefreshToken = Deno.env.get('JUAN_STRAVA_REFRESH_TOKEN')
    const juanAthleteId = Deno.env.get('JUAN_STRAVA_ATHLETE_ID') || '160774'

    console.log('🔧 Iniciando sincronización con credenciales configuradas...')
    console.log(`📊 Cliente ID: ${stravaClientId}`)
    console.log(`👤 Athlete ID: ${juanAthleteId}`)
    console.log(`🔑 Secrets disponibles:`, {
      hasClientSecret: !!stravaClientSecret,
      hasAccessToken: !!juanAccessToken,
      hasRefreshToken: !!juanRefreshToken
    })

    if (!stravaClientSecret || !juanAccessToken || !juanRefreshToken) {
      throw new Error('Faltan credenciales de Strava. Verifica que todos los secrets estén configurados.')
    }

    let accessToken = juanAccessToken
    let refreshToken = juanRefreshToken

    // Intentar refrescar el token de acceso
    console.log('🔄 Refrescando token de acceso...')
    try {
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
        console.log('✅ Token refrescado exitosamente')
      } else {
        const errorText = await refreshResponse.text()
        console.warn('⚠️ No se pudo refrescar token, usando token existente:', errorText)
      }
    } catch (refreshError) {
      console.warn('⚠️ Error al refrescar token, usando token existente:', refreshError)
    }

    // Obtener actividades de Strava
    console.log('📥 Obteniendo actividades de Strava...')
    let page = 1
    let allActivities: StravaActivity[] = []
    let hasMoreActivities = true

    while (hasMoreActivities && page <= 10) {
      console.log(`📄 Procesando página ${page}...`)
      
      const activitiesResponse = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=200`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          },
        }
      )

      if (!activitiesResponse.ok) {
        const errorText = await activitiesResponse.text()
        console.error(`❌ Error al obtener actividades (página ${page}):`, {
          status: activitiesResponse.status,
          statusText: activitiesResponse.statusText,
          error: errorText
        })
        
        // Si es error 401, el token está inválido
        if (activitiesResponse.status === 401) {
          throw new Error(`Token de acceso inválido. Código: ${activitiesResponse.status}. Respuesta: ${errorText}`)
        }
        
        throw new Error(`Error al obtener actividades: ${activitiesResponse.status} - ${errorText}`)
      }

      const activities: StravaActivity[] = await activitiesResponse.json()
      console.log(`📋 Página ${page}: ${activities.length} actividades obtenidas`)
      
      if (activities.length === 0) {
        hasMoreActivities = false
      } else {
        allActivities.push(...activities)
        page++
      }
    }

    console.log(`✅ Total de actividades obtenidas: ${allActivities.length}`)

    // Filtrar solo carreras
    const runningActivities = allActivities
      .filter(activity => activity.type === 'Run')
      .map(activity => ({
        id: activity.id,
        athlete_id: juanAthleteId,
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

    console.log(`🏃 Carreras filtradas: ${runningActivities.length}`)

    // Guardar actividades en la base de datos
    if (runningActivities.length > 0) {
      console.log('💾 Guardando actividades en la base de datos...')
      
      const { error: insertError } = await supabase
        .from('strava_activities')
        .upsert(runningActivities, { onConflict: 'id' })

      if (insertError) {
        console.error('❌ Error al guardar actividades:', insertError)
        throw new Error(`Error al guardar actividades: ${insertError.message}`)
      }
      
      console.log('✅ Actividades guardadas exitosamente')
    }

    // Actualizar información de conexión con los nuevos tokens
    console.log('🔗 Actualizando información de conexión...')
    const connectionData = {
      athlete_id: juanAthleteId,
      strava_athlete_id: parseInt(juanAthleteId),
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      athlete_data: { firstname: 'Juan', lastname: 'Running Data' },
      scope: 'read,activity:read_all'
    }

    const { error: connectionError } = await supabase
      .from('strava_connections')
      .upsert(connectionData, { onConflict: 'athlete_id' })

    if (connectionError) {
      console.warn('⚠️ Error al actualizar conexión:', connectionError)
    } else {
      console.log('✅ Conexión actualizada exitosamente')
    }

    const result = {
      success: true,
      activities_synced: runningActivities.length,
      total_activities: allActivities.length,
      athlete_id: juanAthleteId,
      timestamp: new Date().toISOString()
    }

    console.log('🎉 Sincronización completada:', result)

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('💥 Error en sync-strava-activities:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Error interno del servidor',
        details: error.toString(),
        timestamp: new Date().toISOString()
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

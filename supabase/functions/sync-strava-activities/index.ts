
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);
const JUAN_ATHLETE_ID = "juan"; // ajustá si usás otro id

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
    console.log('🔧 Iniciando sincronización con tokens persistentes...')

    // ► Leemos tokens guardados (o semilla de env vars)
    const { data: connection } = await supabase
      .from("strava_connections")
      .select("access_token, refresh_token, expires_at")
      .eq("athlete_id", JUAN_ATHLETE_ID)
      .single();

    let accessToken =
      connection?.access_token ?? Deno.env.get("JUAN_STRAVA_ACCESS_TOKEN");
    let refreshToken =
      connection?.refresh_token ?? Deno.env.get("JUAN_STRAVA_REFRESH_TOKEN");
    let expiresAt = Number(connection?.expires_at ?? 0); // unix-seconds

    console.log('🔑 Estado de tokens:', {
      hasConnection: !!connection,
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      expiresAt: expiresAt,
      currentTime: Math.floor(Date.now() / 1000)
    })

    if (!accessToken || !refreshToken) {
      throw new Error('No se encontraron tokens de Strava. Verifica que estén configurados en la base de datos o como secrets.')
    }

    const now = Math.floor(Date.now() / 1000);
    const needsRefresh = now > expiresAt - 300; // 5 min antes de vencer

    if (needsRefresh) {
      console.log('🔄 Refrescando token (expira pronto o ya expiró)...')
      const r = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: Deno.env.get("STRAVA_CLIENT_ID") || '160774',
          client_secret: Deno.env.get("STRAVA_CLIENT_SECRET"),
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      });
      
      if (!r.ok) {
        const errorText = await r.text()
        throw new Error(`No se pudo refrescar token: ${errorText}`)
      }
      
      const t = await r.json();
      accessToken  = t.access_token;
      refreshToken = t.refresh_token;
      expiresAt    = t.expires_at;        // unix-seconds

      console.log('✅ Token refrescado exitosamente, guardando en DB...')

      // guardar / actualizar fila
      await supabase.from("strava_connections").upsert({
        athlete_id: JUAN_ATHLETE_ID,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt,
      });
    } else {
      console.log('⏰ Token aún válido, no necesita refresh')
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
        athlete_id: '160774',
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

    const result = {
      success: true,
      activities_synced: runningActivities.length,
      total_activities: allActivities.length,
      athlete_id: JUAN_ATHLETE_ID,
      token_refreshed: needsRefresh,
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

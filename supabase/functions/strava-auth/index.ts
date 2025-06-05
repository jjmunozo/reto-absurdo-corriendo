
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StravaTokenResponse {
  access_token: string
  refresh_token: string
  expires_at: number
  athlete: {
    id: number
    firstname: string
    lastname: string
    profile: string
    city: string
    state: string
    country: string
  }
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

    const { code, state } = await req.json()

    if (!code) {
      throw new Error('No authorization code provided')
    }

    console.log('Exchanging Strava authorization code for token...')

    // Intercambiar código por token
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: Deno.env.get('STRAVA_CLIENT_ID'),
        client_secret: Deno.env.get('STRAVA_CLIENT_SECRET'),
        code: code,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Strava token exchange failed:', errorText)
      throw new Error(`Strava token exchange failed: ${tokenResponse.status}`)
    }

    const tokenData: StravaTokenResponse = await tokenResponse.json()
    console.log('Token received, saving to database...')

    // Guardar o actualizar conexión de Strava
    const { error: upsertError } = await supabase
      .from('strava_connections')
      .upsert({
        user_id: user.id,
        strava_athlete_id: tokenData.athlete.id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: new Date(tokenData.expires_at * 1000).toISOString(),
        scope: 'read,activity:read_all',
        athlete_data: tokenData.athlete,
      })

    if (upsertError) {
      console.error('Error saving Strava connection:', upsertError)
      throw new Error('Failed to save Strava connection')
    }

    console.log('Strava connection saved successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        athlete: tokenData.athlete 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in strava-auth function:', error)
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


import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Auto-sync cron job started at:', new Date().toISOString())

    // Llamar a la función de sincronización
    const { data, error } = await supabase.functions.invoke('sync-strava-activities')

    if (error) {
      console.error('Error in auto-sync:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log('Auto-sync completed successfully:', data)

    return new Response(JSON.stringify({ 
      success: true,
      timestamp: new Date().toISOString(),
      sync_result: data
    }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in auto-sync cron:', error)
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

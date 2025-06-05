
/**
 * Types for Strava API
 */

export interface StravaTokenResponse {
  token_type: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  access_token: string;
  athlete: StravaAthlete;
}

export interface StravaAthlete {
  id: number;
  username?: string;
  firstname: string;
  lastname: string;
  profile: string;  // URL de la imagen de perfil
  profile_medium?: string; // URL de la imagen de perfil mediana
  city?: string;
  state?: string;
  country?: string;
  sex?: string;
  premium?: boolean;
  summit?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StravaActivity {
  id: number;
  name: string;
  distance: number;            // en metros
  moving_time: number;         // en segundos
  elapsed_time: number;        // en segundos
  total_elevation_gain: number; // en metros
  start_date: string;
  start_date_local: string;
  average_speed: number;       // en metros/segundo
  max_speed: number;           // en metros/segundo
  has_heartrate: boolean;
  average_heartrate?: number;
  max_heartrate?: number;
  type: string;                // Run, Ride, etc.
  workout_type?: number;
  location_city?: string;
  location_country?: string;
  map?: {
    summary_polyline?: string;
    id?: string;
  };
}

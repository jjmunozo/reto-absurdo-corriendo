export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      manual_runs: {
        Row: {
          avg_pace: number
          created_at: string
          distance_km: number
          duration_hours: number
          duration_minutes: number
          duration_seconds: number
          has_pr: boolean
          id: string
          pr_description: string | null
          pr_type: string | null
          start_time: string
          title: string
          total_elevation: number
          updated_at: string
        }
        Insert: {
          avg_pace: number
          created_at?: string
          distance_km: number
          duration_hours?: number
          duration_minutes?: number
          duration_seconds?: number
          has_pr?: boolean
          id?: string
          pr_description?: string | null
          pr_type?: string | null
          start_time: string
          title: string
          total_elevation?: number
          updated_at?: string
        }
        Update: {
          avg_pace?: number
          created_at?: string
          distance_km?: number
          duration_hours?: number
          duration_minutes?: number
          duration_seconds?: number
          has_pr?: boolean
          id?: string
          pr_description?: string | null
          pr_type?: string | null
          start_time?: string
          title?: string
          total_elevation?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      strava_activities: {
        Row: {
          activity_data: Json | null
          athlete_id: string
          created_at: string
          distance: number
          id: number
          location_city: string | null
          location_country: string | null
          moving_time: number
          name: string
          start_date_local: string
          total_elevation_gain: number
          type: string
          updated_at: string
        }
        Insert: {
          activity_data?: Json | null
          athlete_id?: string
          created_at?: string
          distance: number
          id: number
          location_city?: string | null
          location_country?: string | null
          moving_time: number
          name: string
          start_date_local: string
          total_elevation_gain: number
          type: string
          updated_at?: string
        }
        Update: {
          activity_data?: Json | null
          athlete_id?: string
          created_at?: string
          distance?: number
          id?: number
          location_city?: string | null
          location_country?: string | null
          moving_time?: number
          name?: string
          start_date_local?: string
          total_elevation_gain?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      strava_connections: {
        Row: {
          access_token: string
          athlete_data: Json | null
          athlete_id: string
          created_at: string
          expires_at: string
          id: string
          refresh_token: string
          scope: string | null
          strava_athlete_id: number
          updated_at: string
        }
        Insert: {
          access_token: string
          athlete_data?: Json | null
          athlete_id?: string
          created_at?: string
          expires_at: string
          id?: string
          refresh_token: string
          scope?: string | null
          strava_athlete_id: number
          updated_at?: string
        }
        Update: {
          access_token?: string
          athlete_data?: Json | null
          athlete_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          refresh_token?: string
          scope?: string | null
          strava_athlete_id?: number
          updated_at?: string
        }
        Relationships: []
      }
      support_registrations: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          laps_count: number | null
          motivation_message: string
          participation_type: Database["public"]["Enums"]["participation_type"]
          registration_number: number
          updated_at: string
          whatsapp: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          laps_count?: number | null
          motivation_message: string
          participation_type: Database["public"]["Enums"]["participation_type"]
          registration_number: number
          updated_at?: string
          whatsapp: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          laps_count?: number | null
          motivation_message?: string
          participation_type?: Database["public"]["Enums"]["participation_type"]
          registration_number?: number
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_next_registration_number: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
    }
    Enums: {
      participation_type: "run" | "moral_support"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      participation_type: ["run", "moral_support"],
    },
  },
} as const

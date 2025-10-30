export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bus_routes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          short_name: string | null
          university_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          short_name?: string | null
          university_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          short_name?: string | null
          university_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bus_routes_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      bus_schedules: {
        Row: {
          created_at: string
          id: number
          observation: string | null
          route_id: string
          schedule: Json
          updated_at: string
          valid_on: Database["public"]["Enums"]["day_type"]
        }
        Insert: {
          created_at?: string
          id?: number
          observation?: string | null
          route_id: string
          schedule: Json
          updated_at?: string
          valid_on: Database["public"]["Enums"]["day_type"]
        }
        Update: {
          created_at?: string
          id?: number
          observation?: string | null
          route_id?: string
          schedule?: Json
          updated_at?: string
          valid_on?: Database["public"]["Enums"]["day_type"]
        }
        Relationships: [
          {
            foreignKeyName: "bus_schedules_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "bus_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      campuses: {
        Row: {
          city: string | null
          created_at: string
          has_circular_bus: boolean
          id: string
          name: string
          university_id: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          has_circular_bus?: boolean
          id?: string
          name: string
          university_id: string
        }
        Update: {
          city?: string | null
          created_at?: string
          has_circular_bus?: boolean
          id?: string
          name?: string
          university_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campuses_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          color: string
          day: string
          end_time: string
          id: string
          professor: string
          room: string
          start_time: string
          subject_name: string | null
          user_id: string
        }
        Insert: {
          color: string
          day: string
          end_time: string
          id?: string
          professor: string
          room: string
          start_time: string
          subject_name?: string | null
          user_id: string
        }
        Update: {
          color?: string
          day?: string
          end_time?: string
          id?: string
          professor?: string
          room?: string
          start_time?: string
          subject_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          status: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          campus_id: string | null
          full_name: string | null
          id: string
          semestre_ingresso: string | null
        }
        Insert: {
          avatar_url?: string | null
          campus_id?: string | null
          full_name?: string | null
          id: string
          semestre_ingresso?: string | null
        }
        Update: {
          avatar_url?: string | null
          campus_id?: string | null
          full_name?: string | null
          id?: string
          semestre_ingresso?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          date: string | null
          id: string
          priority: string | null
          text: string | null
          user_id: string | null
        }
        Insert: {
          date?: string | null
          id?: string
          priority?: string | null
          text?: string | null
          user_id?: string | null
        }
        Update: {
          date?: string | null
          id?: string
          priority?: string | null
          text?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      universities: {
        Row: {
          academic_system_url: string | null
          bus_info_details: string | null
          created_at: string
          id: string
          name: string
          short_name: string | null
        }
        Insert: {
          academic_system_url?: string | null
          bus_info_details?: string | null
          created_at?: string
          id?: string
          name: string
          short_name?: string | null
        }
        Update: {
          academic_system_url?: string | null
          bus_info_details?: string | null
          created_at?: string
          id?: string
          name?: string
          short_name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_university_id: { Args: never; Returns: string }
    }
    Enums: {
      day_type: "dias_uteis" | "sabado" | "domingo_feriado"
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
      day_type: ["dias_uteis", "sabado", "domingo_feriado"],
    },
  },
} as const
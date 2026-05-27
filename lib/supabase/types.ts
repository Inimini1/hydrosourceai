export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_color: string | null
          role: string
          onboarding_complete: boolean
          experience_level: string | null
          primary_goal: string | null
          test_frequency: string | null
          main_challenge: string | null
          user_type: string | null
          num_pools: string | null
          pool_purpose: string | null
          beta_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_color?: string | null
          role?: string
          onboarding_complete?: boolean
          experience_level?: string | null
          primary_goal?: string | null
          test_frequency?: string | null
          main_challenge?: string | null
          user_type?: string | null
          num_pools?: string | null
          pool_purpose?: string | null
          beta_expires_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
        Relationships: []
      }
      pools: {
        Row: {
          id: string
          user_id: string
          pool_name: string
          gallons: number
          chlorine_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pool_name: string
          gallons: number
          chlorine_type?: string
        }
        Update: {
          pool_name?: string
          gallons?: number
          chlorine_type?: string
          updated_at?: string
        }
        Relationships: [{ foreignKeyName: 'pools_user_id_fkey'; columns: ['user_id']; referencedRelation: 'users'; referencedColumns: ['id'] }]
      }
      water_tests: {
        Row: {
          id: string
          pool_id: string
          chlorine: number
          ph: number
          alkalinity: number
          calcium_hardness: number | null
          cyanuric_acid: number | null
          temperature: number | null
          water_clarity: string | null
          odor: string | null
          symptoms: string | null
          image_url: string | null
          status: string
          ai_analysis: string
          created_at: string
        }
        Insert: {
          id?: string
          pool_id: string
          chlorine: number
          ph: number
          alkalinity: number
          calcium_hardness?: number | null
          cyanuric_acid?: number | null
          temperature?: number | null
          water_clarity?: string | null
          odor?: string | null
          symptoms?: string | null
          image_url?: string | null
          status: string
          ai_analysis: string
        }
        Update: Partial<Database['public']['Tables']['water_tests']['Insert']>
        Relationships: [{ foreignKeyName: 'water_tests_pool_id_fkey'; columns: ['pool_id']; referencedRelation: 'pools'; referencedColumns: ['id'] }]
      }
      service_logs: {
        Row: {
          id: string
          pool_id: string
          notes: string
          chemicals_added: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          pool_id: string
          notes: string
          chemicals_added?: string | null
          image_url?: string | null
        }
        Update: Partial<Database['public']['Tables']['service_logs']['Insert']>
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_sub_id: string | null
          plan_type: string
          status: string
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_sub_id?: string | null
          plan_type?: string
          status?: string
          current_period_end?: string | null
        }
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          read?: boolean
        }
        Update: { read?: boolean }
        Relationships: []
      }
      beta_invites: {
        Row: {
          id: string
          email: string
          name: string
          company: string | null
          token: string
          expires_at: string
          used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          company?: string | null
          token: string
          expires_at: string
          used_at?: string | null
        }
        Update: { used_at?: string | null }
        Relationships: []
      }
      rate_limits: {
        Row: { key: string; count: number; reset_at: string }
        Insert: { key: string; count?: number; reset_at: string }
        Update: { count?: number; reset_at?: string }
        Relationships: []
      }
      stripe_processed_events: {
        Row: { event_id: string; processed_at: string }
        Insert: { event_id: string; processed_at?: string }
        Update: { processed_at?: string }
        Relationships: []
      }
      feedback: {
        Row: {
          id: string
          user_id: string | null
          user_email: string | null
          message: string
          category: 'bug' | 'feature' | 'ux' | 'pricing' | 'general'
          page_url: string | null
          app_version: string
          status: 'new' | 'reviewed' | 'actioned' | 'closed'
          founder_note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          user_email?: string | null
          message: string
          category?: 'bug' | 'feature' | 'ux' | 'pricing' | 'general'
          page_url?: string | null
          app_version?: string
          status?: 'new' | 'reviewed' | 'actioned' | 'closed'
          founder_note?: string | null
        }
        Update: {
          status?: 'new' | 'reviewed' | 'actioned' | 'closed'
          founder_note?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      increment_rate_limit: {
        Args: { p_key: string; p_limit: number; p_window_ms: number }
        Returns: { allowed: boolean; remaining: number; retry_after_ms: number }[]
      }
    }
    Enums: Record<string, never>
  }
}

// Convenience row types
export type Profile      = Database['public']['Tables']['profiles']['Row']
export type Pool         = Database['public']['Tables']['pools']['Row']
export type WaterTest    = Database['public']['Tables']['water_tests']['Row']
export type ServiceLog   = Database['public']['Tables']['service_logs']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type BetaInvite   = Database['public']['Tables']['beta_invites']['Row']
export type Feedback     = Database['public']['Tables']['feedback']['Row']

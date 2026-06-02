export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'student' | 'coach' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'student' | 'coach' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'student' | 'coach' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      student_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          phone: string | null
          handedness: 'right' | 'left' | 'unknown'
          skill_level: 'beginner' | 'intermediate' | 'advanced' | 'scratch'
          goals: string | null
          handicap: number | null
          scoring_range: string | null
          notes: string | null
          onboarding_complete: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          phone?: string | null
          handedness?: 'right' | 'left' | 'unknown'
          skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'scratch'
          goals?: string | null
          handicap?: number | null
          scoring_range?: string | null
          notes?: string | null
          onboarding_complete?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          phone?: string | null
          handedness?: 'right' | 'left' | 'unknown'
          skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'scratch'
          goals?: string | null
          handicap?: number | null
          scoring_range?: string | null
          notes?: string | null
          onboarding_complete?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          sessions_included: number
          price_cents: number
          stripe_price_id: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          sessions_included: number
          price_cents: number
          stripe_price_id?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          sessions_included?: number
          price_cents?: number
          stripe_price_id?: string | null
          active?: boolean
          created_at?: string
        }
      }
      credit_ledger: {
        Row: {
          id: string
          user_id: string
          amount: number
          transaction_type: 'credit_purchase' | 'session_debit' | 'admin_adjustment' | 'refund'
          reference_id: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          transaction_type: 'credit_purchase' | 'session_debit' | 'admin_adjustment' | 'refund'
          reference_id?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          transaction_type?: 'credit_purchase' | 'session_debit' | 'admin_adjustment' | 'refund'
          reference_id?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          student_id: string
          coach_id: string | null
          scheduled_at: string
          duration_minutes: number
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          notes: string | null
          credits_debited: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          coach_id?: string | null
          scheduled_at: string
          duration_minutes?: number
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          notes?: string | null
          credits_debited?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          coach_id?: string | null
          scheduled_at?: string
          duration_minutes?: number
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          notes?: string | null
          credits_debited?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

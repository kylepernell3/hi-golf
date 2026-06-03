export type UserRole = 'student' | 'coach' | 'admin'
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'scratch'
export type Handedness = 'right' | 'left' | 'unknown'
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
export type LedgerEntryType =
  | 'purchase'
  | 'booking_debit'
  | 'cancellation_refund'
  | 'manual_credit'
  | 'manual_debit'
  | 'promo'

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          phone: string | null
          handedness: Handedness
          skill_level: SkillLevel
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
          handedness?: Handedness
          skill_level?: SkillLevel
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
          handedness?: Handedness
          skill_level?: SkillLevel
          goals?: string | null
          handicap?: number | null
          scoring_range?: string | null
          notes?: string | null
          onboarding_complete?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          id: string
          student_id: string
          coach_id: string | null
          scheduled_at: string
          duration_minutes: number
          status: BookingStatus
          location: string | null
          student_notes: string | null
          coach_notes: string | null
          ledger_entry_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          coach_id?: string | null
          scheduled_at: string
          duration_minutes?: number
          status?: BookingStatus
          location?: string | null
          student_notes?: string | null
          coach_notes?: string | null
          ledger_entry_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          coach_id?: string | null
          scheduled_at?: string
          duration_minutes?: number
          status?: BookingStatus
          location?: string | null
          student_notes?: string | null
          coach_notes?: string | null
          ledger_entry_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      credit_ledger: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: LedgerEntryType
          description: string | null
          booking_id: string | null
          stripe_session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: LedgerEntryType
          description?: string | null
          booking_id?: string | null
          stripe_session_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: LedgerEntryType
          description?: string | null
          booking_id?: string | null
          stripe_session_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      swing_uploads: {
        Row: {
          id: string
          user_id: string
          file_url: string
          coach_notes: string | null
          status: 'pending' | 'reviewed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_url: string
          coach_notes?: string | null
          status?: 'pending' | 'reviewed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_url?: string
          coach_notes?: string | null
          status?: 'pending' | 'reviewed'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

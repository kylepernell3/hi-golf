// Auto-generate the full version via: npx supabase gen types typescript --project-id YOUR_PROJECT_ID
// This is the hand-authored version for Release 1 to unblock TypeScript immediately.

export type UserRole = 'student' | 'coach' | 'admin'
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'scratch'
export type Handedness = 'right' | 'left'
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
export type LedgerEntryType =
  | 'purchase'
  | 'booking_debit'
  | 'cancellation_refund'
  | 'manual_credit'
  | 'manual_debit'
  | 'promo'
export type ProductType = 'lesson_pack'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: UserRole
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      student_profiles: {
        Row: {
          id: string
          user_id: string
          phone: string | null
          handedness: Handedness | null
          skill_level: SkillLevel | null
          goals: string | null
          handicap_index: number | null
          avg_score: number | null
          physical_notes: string | null
          onboarding_complete: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['student_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['student_profiles']['Insert']>
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          type: ProductType
          sessions_included: number
          price_cents: number
          stripe_price_id: string | null
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      credit_ledger: {
        Row: {
          id: string
          student_id: string
          delta: number
          entry_type: LedgerEntryType
          product_id: string | null
          booking_id: string | null
          stripe_payment_intent_id: string | null
          note: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['credit_ledger']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['credit_ledger']['Insert']>
      }
      bookings: {
        Row: {
          id: string
          student_id: string
          coach_id: string | null
          scheduled_at: string
          duration_mins: number
          status: BookingStatus
          location: string | null
          student_notes: string | null
          coach_notes: string | null
          ledger_entry_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>
      }
    }
    Views: {
      student_credit_balances: {
        Row: {
          student_id: string
          balance: number
        }
      }
    }
    Functions: {}
    Enums: {
      user_role: UserRole
      skill_level: SkillLevel
      handedness: Handedness
      booking_status: BookingStatus
      ledger_entry_type: LedgerEntryType
      product_type: ProductType
    }
  }
}

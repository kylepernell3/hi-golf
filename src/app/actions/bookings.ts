'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function bookSession(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const scheduledAt = formData.get('scheduled_at') as string
  const durationMins = Number(formData.get('duration_mins')) || 60
  const location = formData.get('location') as string | null
  const studentNotes = formData.get('student_notes') as string | null

  if (!scheduledAt) {
    throw new Error('Please select a date and time for your session')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { error } = await db
    .from('bookings')
    .insert({
      student_id: user.id,
      scheduled_at: scheduledAt,
      duration_mins: durationMins,
      location: location || null,
      student_notes: studentNotes || null,
      status: 'pending',
    })

  if (error) throw new Error(`Failed to book session: ${error.message}`)

  revalidatePath('/dashboard')
  redirect('/dashboard?booked=1')
}

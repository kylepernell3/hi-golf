'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function logRound(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const courseName = formData.get('course_name') as string
  const playedDate = formData.get('played_date') as string
  const holes = Number(formData.get('holes'))
  const grossScore = Number(formData.get('gross_score'))
  const courseRating = formData.get('course_rating') ? Number(formData.get('course_rating')) : null
  const slopeRating = formData.get('slope_rating') ? Number(formData.get('slope_rating')) : null
  const fairwaysHit = formData.get('fairways_hit') ? Number(formData.get('fairways_hit')) : null
  const greensInRegulation = formData.get('greens_in_regulation') ? Number(formData.get('greens_in_regulation')) : null
  const putts = formData.get('putts') ? Number(formData.get('putts')) : null
  const notes = formData.get('notes') as string | null
  const weather = formData.get('weather') as string | null

  if (!courseName || !playedDate || !holes || !grossScore) {
    throw new Error('Missing required fields')
  }

  // Insert the round — DB trigger (rounds_credit_trigger) auto-awards 50 credits
  const { error } = await supabase
    .from('rounds')
    .insert({
      student_id: user.id,
      course_name: courseName,
      played_date: playedDate,
      holes,
      gross_score: grossScore,
      course_rating: courseRating,
      slope_rating: slopeRating,
      fairways_hit: fairwaysHit,
      greens_in_regulation: greensInRegulation,
      putts,
      notes: notes || null,
      weather: weather || null,
      points_earned: 50,
    })

  if (error) throw new Error(`Failed to log round: ${error.message}`)

  revalidatePath('/dashboard/rounds')
  revalidatePath('/dashboard/rewards')
  redirect('/dashboard/rounds')
}

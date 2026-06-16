'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const SWING_UPLOAD_CREDITS = 25

export async function logSwingUpload(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const fileUrl = formData.get('file_url') as string
  const recordedDate = formData.get('recorded_date') as string
  const clubUsed = formData.get('club_used') as string | null
  const category = (formData.get('category') as string) || 'full_swing'
  const notes = formData.get('notes') as string | null

  if (!fileUrl || !recordedDate) {
    throw new Error('Missing required fields')
  }

  // 1. Insert the swing upload
  const { data: swing, error: swingError } = await supabase
    .from('swing_uploads')
    .insert({
      student_id: user.id,
      file_url: fileUrl,
      recorded_date: recordedDate,
      club_used: clubUsed || null,
      category,
      notes: notes || null,
    })
    .select('id')
    .single()

  if (swingError || !swing) throw new Error(`Failed to save swing: ${swingError?.message}`)

  // 2. Manually award credits via the DB function (no auto-trigger on swing_uploads)
  const { error: creditError } = await supabase.rpc('create_credit_transaction', {
    p_student_id: user.id,
    p_amount: SWING_UPLOAD_CREDITS,
    p_transaction_type: 'manual_adjustment',
    p_reference_id: swing.id,
    p_reference_type: 'swing_upload',
    p_description: `Credits earned from swing upload (${category})`,
    p_created_by: user.id,
  })

  if (creditError) {
    // Log but don\'t fail — swing is saved, credit will be retried manually
    console.error('Credit award failed for swing upload:', creditError.message)
  }

  revalidatePath('/dashboard/swings')
  revalidatePath('/dashboard/rewards')
  redirect('/dashboard/swings')
}

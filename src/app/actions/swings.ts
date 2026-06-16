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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // 1. Insert the swing upload
  const { data: swing, error: swingError } = await db
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

  // 2. Award credits via the ledger function
  const { error: creditError } = await db.rpc('create_credit_transaction', {
    p_student_id: user.id,
    p_amount: SWING_UPLOAD_CREDITS,
    p_transaction_type: 'swing_upload',
    p_note: `Swing uploaded on ${recordedDate}`,
  })

  if (creditError) {
    console.error('Credit award failed:', creditError.message)
  }

  revalidatePath('/dashboard/swings')
  revalidatePath('/dashboard/rewards')
  redirect('/dashboard/swings')
}

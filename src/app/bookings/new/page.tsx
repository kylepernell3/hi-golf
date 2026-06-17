import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { bookSession } from '@/app/actions/bookings'

export default async function BookSessionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get today's date in local format for min date
  const today = new Date().toISOString().slice(0, 16)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-zinc-400 mb-8">
          <Link href="/dashboard" className="hover:text-white transition-colors">← Dashboard</Link>
          <span>/</span>
          <span className="text-white">Book a Session</span>
        </div>

        <h1 className="text-3xl font-bold mb-1">
          Book a <span className="text-amber-400 italic font-serif">Session</span>
        </h1>
        <p className="text-zinc-400 mb-8">Schedule time with your coach</p>

        <form action={bookSession} className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">Session Details</p>

            {/* Date & Time */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                Date &amp; Time <span className="text-amber-400">*</span>
              </label>
              <input
                type="datetime-local"
                name="scheduled_at"
                required
                min={today}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Duration</label>
              <select
                name="duration_mins"
                defaultValue="60"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="30">30 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
                <option value="120">2 hours</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Location</label>
              <input
                type="text"
                name="location"
                placeholder="e.g. Driving range, Course name, Virtual"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Notes for Coach</label>
              <textarea
                name="student_notes"
                rows={4}
                placeholder="What would you like to work on? Any specific goals for this session?"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold py-4 rounded-xl transition-colors text-base"
          >
            Request Session
          </button>
        </form>
      </div>
    </div>
  )
}

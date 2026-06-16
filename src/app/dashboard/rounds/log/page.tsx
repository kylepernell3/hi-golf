import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { logRound } from '@/app/actions/rounds'

export default async function LogRoundPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="sticky top-0 z-30 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl px-4 py-4">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <Link href="/dashboard/rounds" className="text-zinc-400 hover:text-white text-sm">← Rounds</Link>
          <span className="text-zinc-600">/</span>
          <span className="text-sm text-zinc-300">Log Round</span>
        </div>
      </header>
      <main className="max-w-xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Log a Round</h1>
          <p className="text-zinc-400 text-sm mt-1">Every round earns you <span className="text-amber-400 font-semibold">+50 credits</span></p>
        </div>
        <form action={logRound} className="space-y-5">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Round Info</h2>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Course Name *</label>
              <input name="course_name" type="text" required placeholder="e.g. Pine Valley Golf Club" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Date Played *</label>
                <input name="played_date" type="date" required defaultValue={today} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Holes *</label>
                <select name="holes" required defaultValue="18" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500">
                  <option value="18">18 holes</option>
                  <option value="9">9 holes</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Gross Score *</label>
                <input name="gross_score" type="number" required min="40" max="200" placeholder="72" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Course Rating</label>
                <input name="course_rating" type="number" step="0.1" min="55" max="80" placeholder="72.4" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Slope Rating</label>
                <input name="slope_rating" type="number" min="55" max="155" placeholder="113" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500" />
              </div>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Optional Stats</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Fairways Hit</label>
                <input name="fairways_hit" type="number" min="0" max="18" placeholder="10" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">GIR</label>
                <input name="greens_in_regulation" type="number" min="0" max="18" placeholder="12" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Putts</label>
                <input name="putts" type="number" min="18" max="72" placeholder="32" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Weather</label>
              <input name="weather" type="text" placeholder="Sunny, light breeze..." className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Notes</label>
              <textarea name="notes" rows={3} placeholder="How did the round go?" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none" />
            </div>
          </div>
          <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-xl transition-colors">
            Log Round &amp; Earn 50 Credits ⛳
          </button>
        </form>
      </main>
    </div>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { logSwingUpload } from '@/app/actions/swings'

const today = new Date().toISOString().split('T')[0]

export default async function UploadSwingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="sticky top-0 z-30 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl px-4 py-4">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <Link href="/dashboard/swings" className="text-zinc-400 hover:text-white text-sm">&larr; Swings</Link>
          <span className="text-zinc-600">/</span>
          <span className="text-sm text-zinc-300">Upload Swing</span>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Upload a Swing</h1>
          <p className="text-zinc-400 text-sm mt-1">Every upload earns you <span className="text-amber-400 font-semibold">+25 credits</span></p>
        </div>

        <form action={logSwingUpload} className="space-y-5">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Swing Details</h2>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">Video URL *</label>
              <input
                name="file_url"
                type="url"
                required
                placeholder="https://youtube.com/watch?v=... or cloud link"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
              <p className="text-xs text-zinc-600 mt-1">Paste a YouTube, Google Drive, or Dropbox link</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Date Recorded *</label>
                <input
                  name="recorded_date"
                  type="date"
                  required
                  defaultValue={today}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Category</label>
                <select
                  name="category"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="full_swing">Full Swing</option>
                  <option value="driver">Driver</option>
                  <option value="iron">Iron</option>
                  <option value="wedge">Wedge</option>
                  <option value="chipping">Chipping</option>
                  <option value="putting">Putting</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">Club Used</label>
              <input
                name="club_used"
                type="text"
                placeholder="e.g. 7-iron, Driver, 60-degree wedge"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">Notes</label>
              <textarea
                name="notes"
                rows={3}
                placeholder="What were you working on? Any specific feels?"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-xl transition-colors"
          >
            Upload Swing &amp; Earn 25 Credits
          </button>
        </form>
      </main>
    </div>
  )
}

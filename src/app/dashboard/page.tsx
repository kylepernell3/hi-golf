import { getDashboardData } from '@/lib/dashboard'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function DashboardPage() {
  const dashboardData = await getDashboardData()

  if (!dashboardData.user) {
    redirect('/login')
  }

  const { user, profile, streak, credits, latestSwing } = dashboardData

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header with Logout */}
      <div className="border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-zinc-400 text-sm sm:text-base mt-1">
                Welcome back, {profile?.full_name || user.email?.split('@')[0]}
              </p>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm sm:text-base"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Stats Grid - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* Credits Card */}
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <span className="text-xl sm:text-2xl">🎯</span>
              </div>
              <div className="text-right">
                <p className="text-2xl sm:text-3xl font-bold text-white">{credits || 0}</p>
                <p className="text-xs sm:text-sm text-amber-400">Credits</p>
              </div>
            </div>
            <p className="text-zinc-400 text-xs sm:text-sm">Use for swing analysis & coaching</p>
          </div>

          {/* Streak Card */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <span className="text-xl sm:text-2xl">🔥</span>
              </div>
              <div className="text-right">
                <p className="text-2xl sm:text-3xl font-bold text-white">{streak || 0}</p>
                <p className="text-xs sm:text-sm text-emerald-400">Day Streak</p>
              </div>
            </div>
            <p className="text-zinc-400 text-xs sm:text-sm">Keep training to grow your streak</p>
          </div>

          {/* Handicap Card */}
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl p-5 sm:p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <span className="text-xl sm:text-2xl">⛳</span>
              </div>
              <div className="text-right">
                <p className="text-2xl sm:text-3xl font-bold text-white">{profile?.handicap || '--'}</p>
                <p className="text-xs sm:text-sm text-blue-400">Handicap</p>
              </div>
            </div>
            <p className="text-zinc-400 text-xs sm:text-sm">Track rounds to update</p>
          </div>
        </div>

        {/* Latest Activity */}
        {latestSwing && (
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 sm:p-6 lg:p-8 mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Latest Swing Analysis</h2>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <p className="text-white font-medium text-base sm:text-lg mb-1">
                    {latestSwing.club_type || 'Driver'}
                  </p>
                  <p className="text-zinc-400 text-xs sm:text-sm">
                    {formatDateTime(latestSwing.created_at)}
                  </p>
                </div>
                <Link
                  href="/dashboard/swings"
                  className="inline-flex items-center justify-center px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm sm:text-base w-full sm:w-auto"
                >
                  View analysis ↗
                </Link>
              </div>
              {latestSwing.coach_notes && (
                <div className="bg-zinc-800/40 rounded-xl p-4 border border-zinc-700/50">
                  <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                    {latestSwing.coach_notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions Grid - Mobile Optimized */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Upload Swing */}
            <Link
              href="/dashboard/swings"
              className="group bg-zinc-900/60 border border-zinc-800/60 hover:border-amber-500/40 rounded-2xl p-5 sm:p-6 transition-all hover:shadow-lg hover:shadow-amber-500/10"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl sm:text-3xl">📹</span>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Upload Swing</h3>
              <p className="text-zinc-400 text-xs sm:text-sm">Get AI-powered analysis and coaching</p>
            </Link>

            {/* Log Round */}
            <Link
              href="/dashboard/rounds"
              className="group bg-zinc-900/60 border border-zinc-800/60 hover:border-emerald-500/40 rounded-2xl p-5 sm:p-6 transition-all hover:shadow-lg hover:shadow-emerald-500/10"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl sm:text-3xl">⛳</span>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Log Round</h3>
              <p className="text-zinc-400 text-xs sm:text-sm">Track scores and update handicap</p>
            </Link>

            {/* View Progress */}
            <Link
              href="/dashboard/progress"
              className="group bg-zinc-900/60 border border-zinc-800/60 hover:border-blue-500/40 rounded-2xl p-5 sm:p-6 transition-all hover:shadow-lg hover:shadow-blue-500/10"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl sm:text-3xl">📊</span>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">View Progress</h3>
              <p className="text-zinc-400 text-xs sm:text-sm">Track improvement over time</p>
            </Link>

            {/* Rewards */}
            <Link
              href="/dashboard/rewards"
              className="group bg-zinc-900/60 border border-zinc-800/60 hover:border-purple-500/40 rounded-2xl p-5 sm:p-6 transition-all hover:shadow-lg hover:shadow-purple-500/10"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl sm:text-3xl">🎁</span>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Rewards</h3>
              <p className="text-zinc-400 text-xs sm:text-sm">Redeem credits for prizes</p>
            </Link>
          </div>
        </div>

        {/* Explore Platform Section - Mobile Optimized */}
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6 sm:p-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">Explore Your Platform</h2>
            <p className="text-zinc-400 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8">Access all features and tools to improve your game</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <Link
                href="/dashboard/swings"
                className="flex flex-col items-center justify-center p-4 sm:p-6 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl transition-colors"
              >
                <span className="text-3xl sm:text-4xl mb-2">📹</span>
                <span className="text-white text-xs sm:text-sm font-medium">Swing Library</span>
              </Link>
              
              <Link
                href="/dashboard/rounds"
                className="flex flex-col items-center justify-center p-4 sm:p-6 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl transition-colors"
              >
                <span className="text-3xl sm:text-4xl mb-2">⛳</span>
                <span className="text-white text-xs sm:text-sm font-medium">Rounds</span>
              </Link>
              
              <Link
                href="/dashboard/progress"
                className="flex flex-col items-center justify-center p-4 sm:p-6 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl transition-colors"
              >
                <span className="text-3xl sm:text-4xl mb-2">📊</span>
                <span className="text-white text-xs sm:text-sm font-medium">Progress</span>
              </Link>
              
              <Link
                href="/dashboard/rewards"
                className="flex flex-col items-center justify-center p-4 sm:p-6 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl transition-colors"
              >
                <span className="text-3xl sm:text-4xl mb-2">🎁</span>
                <span className="text-white text-xs sm:text-sm font-medium">Rewards</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

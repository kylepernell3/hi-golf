import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="relative min-h-screen bg-zinc-950 overflow-x-hidden">
      {/* Ambient background effects */}
      <div aria-hidden className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-gradient-to-r from-amber-500/20 to-emerald-500/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none fixed bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none fixed top-0 left-0 right-0 z-50 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-white font-bold text-xl sm:text-2xl tracking-tight">
                Hi<span className="text-amber-500">Golf</span>
              </span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/login"
                className="text-zinc-300 hover:text-white transition-colors text-sm sm:text-base"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-semibold rounded-lg transition-colors text-sm sm:text-base"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Mobile Optimized */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-24 pb-16 sm:pb-20 lg:pb-32">
        <div className="max-w-6xl mx-auto text-center">
          {/* Rewards Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full mb-6 sm:mb-8">
            <span className="text-2xl sm:text-3xl">🎁</span>
            <span className="text-amber-400 text-sm sm:text-base font-medium">Earn Rewards While You Improve</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 sm:mb-8 tracking-tight leading-tight">
            Train Smarter.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-emerald-400">
              Get Rewarded.
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-zinc-400 mb-8 sm:mb-10 lg:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
            Upload your swing videos, get AI-powered coaching, and earn credits to redeem for golf gear, lessons, and exclusive prizes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl transition-all hover:scale-105 text-base sm:text-lg shadow-lg shadow-amber-500/25"
            >
              Start Earning Credits
            </Link>
            <Link
              href="#how-it-works"
              className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-colors text-base sm:text-lg"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Rewards Preview Section - Mobile Optimized */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
              Every Swing Earns You Rewards
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-zinc-400 max-w-2xl mx-auto px-4">
              Build your credit balance through training and redeem for amazing prizes
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {/* Upload Video */}
            <div className="group relative bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-zinc-800/60 hover:border-amber-500/40 rounded-2xl p-6 sm:p-8 transition-all hover:scale-105">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-amber-500/20 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl sm:text-4xl">📹</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Upload Swing</h3>
              <p className="text-sm sm:text-base text-zinc-400 mb-4">Record and upload your swing video</p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 rounded-lg">
                <span className="text-amber-400 font-bold text-sm sm:text-base">+10 credits</span>
              </div>
            </div>

            {/* Get Analysis */}
            <div className="group relative bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-zinc-800/60 hover:border-emerald-500/40 rounded-2xl p-6 sm:p-8 transition-all hover:scale-105">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl sm:text-4xl">🎯</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Get Analysis</h3>
              <p className="text-sm sm:text-base text-zinc-400 mb-4">AI analyzes your swing mechanics</p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 rounded-lg">
                <span className="text-emerald-400 font-bold text-sm sm:text-base">+15 credits</span>
              </div>
            </div>

            {/* Track Progress */}
            <div className="group relative bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-zinc-800/60 hover:border-blue-500/40 rounded-2xl p-6 sm:p-8 transition-all hover:scale-105">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl sm:text-4xl">📊</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Log Rounds</h3>
              <p className="text-sm sm:text-base text-zinc-400 mb-4">Track your scores and stats</p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 rounded-lg">
                <span className="text-blue-400 font-bold text-sm sm:text-base">+20 credits</span>
              </div>
            </div>

            {/* Daily Streaks */}
            <div className="group relative bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-zinc-800/60 hover:border-purple-500/40 rounded-2xl p-6 sm:p-8 transition-all hover:scale-105">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl sm:text-4xl">🔥</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Daily Streaks</h3>
              <p className="text-sm sm:text-base text-zinc-400 mb-4">Train daily for bonus credits</p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 rounded-lg">
                <span className="text-purple-400 font-bold text-sm sm:text-base">+25 credits</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Mobile Optimized */}
      <section id="how-it-works" className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-32 bg-gradient-to-b from-transparent to-zinc-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
              Your Path to Better Golf
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-zinc-400 px-4">
              A rewards-driven training platform built for serious golfers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-4xl sm:text-5xl">📱</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">1. Upload</h3>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed px-4">
                Record your swing from your phone and upload it instantly. Our AI starts analyzing immediately.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-4xl sm:text-5xl">🤖</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">2. Analyze</h3>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed px-4">
                Get detailed feedback on your mechanics, tempo, and alignment. Earn credits for every analysis.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-4xl sm:text-5xl">🏆</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">3. Redeem</h3>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed px-4">
                Use your credits for golf gear, pro lessons, course vouchers, and exclusive merchandise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Mobile Optimized */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-32">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/30 rounded-3xl p-8 sm:p-12 lg:p-16 text-center overflow-hidden">
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.15),transparent_50%)]" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
                Ready to Start Earning?
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-zinc-300 mb-8 sm:mb-10 max-w-2xl mx-auto">
                Join thousands of golfers improving their game and earning rewards
              </p>
              <Link
                href="/signup"
                className="inline-block px-8 sm:px-12 py-4 sm:py-5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl transition-all hover:scale-105 text-base sm:text-lg shadow-2xl"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800/50 bg-zinc-950/50 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-zinc-400 text-sm sm:text-base">
            © 2026 HiGolf. Train better, earn more.
          </p>
        </div>
      </footer>
    </div>
  )
}

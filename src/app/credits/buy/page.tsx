import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import BuyButton from './BuyButton'

type Product = {
  id: string
  name: string
  description: string | null
  sessions_included: number
  price_cents: number
  stripe_price_id: string | null
}

export default async function BuyCreditsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch active products
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: products } = await db
    .from('products')
    .select('id, name, description, sessions_included, price_cents, stripe_price_id')
    .eq('is_active', true)
    .order('price_cents', { ascending: true })

  const productList: Product[] = products ?? []

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-zinc-400 mb-8">
          <Link href="/dashboard" className="hover:text-white transition-colors">← Dashboard</Link>
          <span>/</span>
          <span className="text-white">Add Balance</span>
        </div>

        <h1 className="text-3xl font-bold mb-1">
          Add <span className="text-amber-400 italic font-serif">Balance</span>
        </h1>
        <p className="text-zinc-400 mb-8">Purchase session credits to book coaching time</p>

        {productList.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-lg font-semibold mb-2">No packages available</h3>
            <p className="text-zinc-400 text-sm">Check back soon for available session packages.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {productList.map((product) => (
              <div
                key={product.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-semibold">{product.name}</span>
                    <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                      {product.sessions_included} session{product.sessions_included !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {product.description && (
                    <p className="text-zinc-400 text-sm">{product.description}</p>
                  )}
                  <p className="text-2xl font-bold text-white mt-2">
                    ${(product.price_cents / 100).toFixed(2)}
                  </p>
                </div>
                <BuyButton productId={product.id} />
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-zinc-600 text-xs mt-8">
          Secure checkout powered by Stripe. Credits are added to your account immediately after payment.
        </p>
      </div>
    </div>
  )
}

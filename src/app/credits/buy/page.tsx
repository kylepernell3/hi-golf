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

export default async function BuyPassPage() {
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
          <Link href="/dashboard" className="hover:text-white transition-colors">&larr; Dashboard</Link>
          <span>/</span>
          <span className="text-white">Buy a Pass</span>
        </div>

        <h1 className="text-3xl font-bold mb-1">
          Buy a <span className="text-amber-400 italic font-serif">Pass</span>
        </h1>
        <p className="text-zinc-400 mb-8">Choose a coaching pass to book your sessions</p>

        {productList.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-lg font-semibold mb-2">No passes available</h3>
            <p className="text-zinc-400">Check back soon for available coaching passes.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {productList.map((product) => (
              <div key={product.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-lg">{product.name}</span>
                    <span className="text-xs bg-amber-500 text-black font-semibold px-2 py-0.5 rounded-full">
                      {product.sessions_included} session{product.sessions_included !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {product.description && (
                    <p className="text-zinc-400 text-sm mb-2">{product.description}</p>
                  )}
                  <p className="text-2xl font-bold">${(product.price_cents / 100).toFixed(2)}</p>
                </div>
                <BuyButton productId={product.id} />
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-zinc-500 text-sm mt-8">
          Secure checkout powered by Stripe. Sessions are added to your account immediately after payment.
        </p>
      </div>
    </div>
  )
}

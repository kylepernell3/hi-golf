'use client'

import { useState } from 'react'

export default function BuyButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleBuy() {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error ?? 'Something went wrong. Please try again.')
        setLoading(false)
      }
    } catch {
      alert('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
    >
      {loading ? 'Redirecting...' : 'Buy Now'}
    </button>
  )
}

import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Hi Golf — Premium Golf Training',
  description: 'Book lessons, track your progress, and elevate your game with Hi Golf.',
  openGraph: {
    title: 'Hi Golf — Premium Golf Training',
    description: 'Book lessons, track your progress, and elevate your game with Hi Golf.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#09090b',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <style>{`
          :root {
            --gold: #f59e0b;
            --gold-light: #fbbf24;
            --green: #059669;
            --brown: #78350f;
            --bg: #09090b;
          }
        `}</style>
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}

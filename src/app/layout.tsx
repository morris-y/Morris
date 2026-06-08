import type { Metadata } from 'next'
import { Geist, Geist_Mono, Bricolage_Grotesque, Instrument_Serif } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const bricolageGrotesque = Bricolage_Grotesque({
  variable: '--font-bricolage',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  style: ['italic'],
  weight: '400',
})

export const metadata: Metadata = {
  title: 'Morris Yang — Product Builder',
  description:
    'Product Builder at the intersection of AI, on-chain data, and prediction markets.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${bricolageGrotesque.variable} ${instrumentSerif.variable}`}
    >
      <body className="antialiased min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

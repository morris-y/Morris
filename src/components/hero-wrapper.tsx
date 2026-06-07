'use client'

import dynamic from 'next/dynamic'

const Hero = dynamic(() => import('./hero').then((m) => m.Hero), {
  ssr: false,
  loading: () => (
    <section className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center" />
  ),
})

export function HeroWrapper() {
  return <Hero />
}

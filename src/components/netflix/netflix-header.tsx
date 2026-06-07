'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'

export function NetflixHeader() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 md:px-12 h-14 flex items-center justify-between',
        scrolled
          ? 'bg-[#141414]'
          : 'bg-gradient-to-b from-black/80 to-transparent',
      ].join(' ')}
    >
      <Link
        href="/"
        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        back
      </Link>
      <span className="text-white/40 text-xs uppercase tracking-widest">morris yang</span>
    </header>
  )
}

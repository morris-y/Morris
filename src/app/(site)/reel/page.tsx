'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { ArrowLeft } from 'lucide-react'

export default function ReelPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <p className="text-5xl mb-6">🌀</p>
        <h1 className="text-white text-2xl font-light mb-3">still loading...</h1>
        <p className="text-white/40 text-sm max-w-xs leading-relaxed">
          the algorithm brought you here early. this mode is in production.
          check back when the content catches up.
        </p>
        <Link
          href="/"
          className="mt-10 inline-flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          back to start
        </Link>
      </motion.div>
    </div>
  )
}

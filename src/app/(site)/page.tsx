'use client'

import Link from 'next/link'
import { motion } from 'motion/react'

const cards = [
  {
    id: 'headhunters',
    label: 'headhunters',
    description: "you're here for the résumé. let's make it worth your time.",
    href: '/projects',
    emoji: '🎯',
    comingSoon: false,
  },
  {
    id: 'overthinkers',
    label: 'overthinkers',
    description: 'you read the whole thing. welcome, you belong here.',
    href: '/notes',
    emoji: '📝',
    comingSoon: false,
  },
  {
    id: 'algorithm',
    label: 'the algorithm sent me',
    description: 'same. not sure why we\'re here. let\'s find out.',
    href: '/reel',
    emoji: '🌀',
    comingSoon: true,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <p className="text-[#666] text-sm uppercase tracking-[0.2em] mb-3">morris yang</p>
        <h1 className="text-white text-3xl sm:text-4xl font-light tracking-tight">
          who brought you here?
        </h1>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-3xl">
        {cards.map((card, i) => (
          <CardItem key={card.id} card={card} index={i} />
        ))}
      </div>
    </div>
  )
}

function CardItem({
  card,
  index,
}: {
  card: (typeof cards)[number]
  index: number
}) {
  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 + index * 0.1 }}
      whileHover={card.comingSoon ? {} : { scale: 1.02, y: -4 }}
      className={[
        'relative flex flex-col flex-1 rounded-xl border p-6 min-h-[200px] transition-colors duration-200',
        card.comingSoon
          ? 'border-white/5 bg-white/[0.02] cursor-default'
          : 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07] cursor-pointer',
      ].join(' ')}
    >
      {card.comingSoon && (
        <span className="absolute top-3 right-3 text-[10px] uppercase tracking-widest text-white/30 border border-white/10 px-2 py-0.5 rounded-full">
          soon
        </span>
      )}
      <span className="text-2xl mb-4">{card.emoji}</span>
      <h2
        className={[
          'text-lg font-medium mb-2',
          card.comingSoon ? 'text-white/30' : 'text-white',
        ].join(' ')}
      >
        {card.label}
      </h2>
      <p
        className={[
          'text-sm leading-relaxed',
          card.comingSoon ? 'text-white/20' : 'text-white/50',
        ].join(' ')}
      >
        {card.description}
      </p>
    </motion.div>
  )

  if (card.comingSoon) return inner
  return <Link href={card.href} className="flex flex-1">{inner}</Link>
}

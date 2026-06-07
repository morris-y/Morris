'use client'

import { motion, useReducedMotion } from 'motion/react'
import { siteConfig } from '@/lib/content'

export function BioSection() {
  const shouldReduceMotion = useReducedMotion()

  const paragraphs = siteConfig.bio
    .split('\n')
    .filter((p) => p.trim().length > 0)

  return (
    <div className="space-y-4">
      {paragraphs.map((paragraph, i) => (
        <motion.p
          key={i}
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={
            shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: i * 0.1 }
          }
          className="text-muted-foreground leading-relaxed"
        >
          {paragraph}
        </motion.p>
      ))}
    </div>
  )
}

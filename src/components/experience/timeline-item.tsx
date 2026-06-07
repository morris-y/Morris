'use client'

import { motion, useReducedMotion } from 'motion/react'
import type { ExperienceItem } from '@/lib/content'

interface TimelineItemProps {
  item: ExperienceItem
  index: number
}

export function TimelineItem({ item, index }: TimelineItemProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={false}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={
        shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: index * 0.1 }
      }
      className="relative pl-8"
    >
      {/* Timeline dot */}
      <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background" />

      <div className="space-y-1.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <h3 className="font-semibold text-foreground">{item.company}</h3>
          <span className="text-xs text-muted-foreground shrink-0">{item.dateRange}</span>
        </div>
        <p className="text-sm font-medium text-muted-foreground">{item.role}</p>
        <ul className="mt-2 space-y-1">
          {item.bullets.map((bullet, i) => (
            <li key={i} className="text-sm text-muted-foreground flex gap-2">
              <span className="shrink-0 mt-1.5 h-1 w-1 rounded-full bg-muted-foreground/50" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

'use client'

import { motion, useReducedMotion } from 'motion/react'
import { Badge } from '@/components/ui/badge'
import { skills } from '@/lib/content'

export function SkillsSection() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5 }}
      className="flex flex-wrap gap-2"
    >
      {skills.map((skill) => (
        <Badge key={skill.label} variant="secondary">
          {skill.label}
        </Badge>
      ))}
    </motion.div>
  )
}

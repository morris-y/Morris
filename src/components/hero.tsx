'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/lib/content'

export function Hero() {
  const shouldReduceMotion = useReducedMotion()

  const variants = {
    hidden: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const transition = (delay: number) =>
    shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay }

  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={variants}
          transition={transition(0)}
          className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
        >
          {siteConfig.name}
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="visible"
          variants={variants}
          transition={transition(0.1)}
          className="mt-4 text-lg text-muted-foreground sm:text-xl"
        >
          {siteConfig.tagline}
        </motion.p>

        <motion.p
          initial="hidden"
          animate="visible"
          variants={variants}
          transition={transition(0.2)}
          className="mt-6 max-w-2xl mx-auto text-base text-muted-foreground/80 leading-relaxed"
        >
          {siteConfig.bio.split('\n')[0]}
        </motion.p>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={variants}
          transition={transition(0.3)}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <Button render={<Link href="/projects" />} nativeButton={false} size="lg">
            View Projects
          </Button>
          <Button render={<Link href="/about" />} nativeButton={false} variant="outline" size="lg">
            About Me
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

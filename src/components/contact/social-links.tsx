'use client'

import { Mail, FileText, X } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/lib/content'

const socialItems = [
  {
    label: 'X (Twitter)',
    href: siteConfig.socials.x ?? '#',
    icon: X,
    external: true,
  },
  {
    label: 'LinkedIn',
    href: siteConfig.socials.linkedin ?? '#',
    icon: () => (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    external: true,
  },
  {
    label: 'Medium',
    href: siteConfig.socials.medium ?? '#',
    icon: FileText,
    external: true,
  },
  {
    label: 'Email',
    href: `mailto:${siteConfig.email}`,
    icon: Mail,
    external: false,
  },
]

export function SocialLinks() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: 0.1 }}
      className="flex flex-wrap gap-3"
    >
      {socialItems.map(({ label, href, icon: Icon, external }) => (
        <Button
          key={label}
          render={
            <a
              href={href}
              {...(external
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
            />
          }
          nativeButton={false}
          variant="outline"
          className="gap-2"
        >
          <Icon />
          {label}
        </Button>
      ))}
    </motion.div>
  )
}

'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Mail } from 'lucide-react'
import { siteConfig } from '@/lib/content'
import type { AppWindowProps } from '@/types/window'

// ─── Icon components ──────────────────────────────────────────────────────────

function XIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.733-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function MediumIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

// ─── Contact links config ─────────────────────────────────────────────────────

interface ContactLink {
  key: string
  label: string
  sublabel: string
  href: string
  icon: React.ComponentType
  isEmail?: boolean
  external?: boolean
}

const contactLinks: ContactLink[] = [
  {
    key: 'email',
    label: 'Email',
    sublabel: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
    icon: Mail,
    isEmail: true,
  },
  {
    key: 'x',
    label: 'X / Twitter',
    sublabel: '@MorrisSHYang',
    href: siteConfig.socials.x ?? '#',
    icon: XIcon,
    external: true,
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    sublabel: 'linkedin.com/in/morrisy',
    href: siteConfig.socials.linkedin ?? '#',
    icon: LinkedInIcon,
    external: true,
  },
  {
    key: 'medium',
    label: 'Medium',
    sublabel: 'morrisy.medium.com',
    href: siteConfig.socials.medium ?? '#',
    icon: MediumIcon,
    external: true,
  },
  {
    key: 'github',
    label: 'GitHub',
    sublabel: 'github.com/morris-y',
    href: siteConfig.socials.github ?? '#',
    icon: GitHubIcon,
    external: true,
  },
]

// ─── Contact button ───────────────────────────────────────────────────────────

interface ContactButtonProps {
  link: ContactLink
  index: number
}

function ContactButton({ link, index }: ContactButtonProps) {
  const [copied, setCopied] = useState(false)
  const Icon = link.icon

  function handleEmailClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!link.isEmail) return
    e.preventDefault()
    navigator.clipboard.writeText(siteConfig.email).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 + index * 0.07, ease: [0.4, 0, 0.2, 1] }}
    >
      <a
        href={link.href}
        onClick={link.isEmail ? handleEmailClick : undefined}
        {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="group flex w-full items-center gap-4 rounded-2xl border border-white/15 bg-white/8 px-5 py-3.5 transition-all duration-200 hover:bg-white/15 hover:border-white/25 active:scale-[0.98]"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white/70 transition-colors duration-200 group-hover:bg-white/18 group-hover:text-white">
          <Icon />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="text-sm font-medium text-white/90 leading-tight">
            {link.isEmail && copied ? 'Copied!' : link.label}
          </span>
          <span className="truncate text-xs text-white/40 leading-tight mt-0.5">
            {link.isEmail && copied ? 'Copied to clipboard' : link.sublabel}
          </span>
        </span>
        <span className="ml-auto text-white/20 transition-colors duration-200 group-hover:text-white/50">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            {link.isEmail ? (
              copied ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              )
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            )}
          </svg>
        </span>
      </a>
    </motion.div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ContactApp(_props: AppWindowProps) {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-auto bg-[#1a1a1a] p-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">

        {/* Avatar monogram */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          className="relative"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-900/40">
            <span className="text-3xl font-bold tracking-tight text-white select-none">MY</span>
          </div>
          {/* Subtle ring */}
          <div className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/10" />
        </motion.div>

        {/* Name + tagline */}
        <motion.div
          className="flex flex-col items-center gap-1.5 text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
        >
          <h1 className="text-2xl font-display font-semibold tracking-display leading-display text-white">
            {siteConfig.name}
          </h1>
          <p className="text-sm leading-snug text-white/50 px-2">
            {siteConfig.tagline}
          </p>
        </motion.div>

        {/* Divider */}
        <motion.div
          className="h-px w-full bg-white/8"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.4, delay: 0.25, ease: [0.4, 0, 0.2, 1] }}
        />

        {/* Contact links */}
        <div className="flex w-full flex-col gap-2.5">
          {contactLinks.map((link, i) => (
            <ContactButton key={link.key} link={link} index={i} />
          ))}
        </div>

      </div>
    </div>
  )
}

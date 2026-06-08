'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { siteConfig, experience, skills } from '@/lib/content'
import type { AppWindowProps } from '@/types/window'

type Section = 'overview' | 'experience' | 'skills' | 'education'

const NAV_ITEMS: { id: Section; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '👤' },
  { id: 'experience', label: 'Experience', icon: '💼' },
  { id: 'skills', label: 'Skills', icon: '⚡' },
  { id: 'education', label: 'Education', icon: '🎓' },
]

const CATEGORY_LABELS: Record<string, string> = {
  domain: 'Domain',
  tech: 'Tech',
  tools: 'Tools',
}

const CATEGORY_COLORS: Record<string, string> = {
  domain: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
  tech: 'bg-purple-500/15 text-purple-300 border-purple-500/20',
  tools: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
}

function OverviewSection() {
  const paragraphs = siteConfig.bio.split('\n').filter((p) => p.trim().length > 0)

  return (
    <div className="p-6 space-y-6">
      {/* Avatar + identity */}
      <div className="flex items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg">
          <span className="text-white font-semibold text-xl select-none">MY</span>
        </div>
        <div className="space-y-1 min-w-0">
          <h2 className="text-white font-display font-semibold text-lg tracking-display leading-display">{siteConfig.name}</h2>
          <p className="text-white/50 text-sm leading-snug">{siteConfig.tagline}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/8" />

      {/* Bio paragraphs */}
      <div className="space-y-4">
        {paragraphs.map((paragraph, i) => (
          <p key={i} className="text-white/70 text-sm leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Contact row */}
      <div className="border-t border-white/8 pt-4 space-y-2">
        <p className="text-white/40 text-xs uppercase tracking-wider font-medium">Contact</p>
        <p className="text-white/70 text-sm">{siteConfig.email}</p>
        <div className="flex flex-wrap gap-3 pt-1">
          {siteConfig.socials.x && (
            <span className="text-blue-400/80 text-xs">𝕏 @MorrisSHYang</span>
          )}
          {siteConfig.socials.linkedin && (
            <span className="text-blue-400/80 text-xs">in /morrisy</span>
          )}
          {siteConfig.socials.github && (
            <span className="text-blue-400/80 text-xs">⌥ morris-y</span>
          )}
        </div>
      </div>
    </div>
  )
}

function ExperienceSection() {
  return (
    <div className="p-6 space-y-1">
      <p className="text-white/40 text-xs uppercase tracking-wider font-medium mb-5">
        Work History
      </p>

      <div className="space-y-0">
        {experience.map((item, index) => (
          <div key={`${item.company}-${item.role}`}>
            <div className="py-4">
              {/* Header row */}
              <div className="flex items-start justify-between gap-3 mb-1">
                <div className="min-w-0">
                  <span className="text-white/90 text-sm font-semibold">{item.company}</span>
                  <span className="text-white/40 text-xs ml-2">{item.role}</span>
                </div>
                <span className="text-white/40 text-xs shrink-0 mt-0.5">{item.dateRange}</span>
              </div>

              {/* Bullets */}
              <ul className="space-y-1.5 mt-2">
                {item.bullets.map((bullet, i) => (
                  <li key={i} className="flex gap-2 text-xs text-white/60 leading-relaxed">
                    <span className="shrink-0 mt-1.5 h-1 w-1 rounded-full bg-white/25" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {index < experience.length - 1 && <div className="border-t border-white/6" />}
          </div>
        ))}
      </div>
    </div>
  )
}

function SkillsSection() {
  const categories = ['domain', 'tech', 'tools'] as const

  return (
    <div className="p-6 space-y-6">
      {categories.map((cat) => {
        const categorySkills = skills.filter((s) => s.category === cat)
        if (categorySkills.length === 0) return null

        return (
          <div key={cat} className="space-y-2.5">
            <p className="text-white/40 text-xs uppercase tracking-wider font-medium">
              {CATEGORY_LABELS[cat]}
            </p>
            <div className="flex flex-wrap gap-2">
              {categorySkills.map((skill) => (
                <span
                  key={skill.label}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs border font-medium',
                    CATEGORY_COLORS[cat]
                  )}
                >
                  {skill.label}
                </span>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function EducationSection() {
  return (
    <div className="p-6 space-y-6">
      <p className="text-white/40 text-xs uppercase tracking-wider font-medium">Education</p>

      {/* Degree block */}
      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-white/90 text-sm font-semibold">
              National Chengchi University (NCCU)
            </p>
            <p className="text-white/50 text-sm">MA, Communications</p>
          </div>
          <span className="text-white/40 text-xs shrink-0 mt-0.5">2020 – 2024</span>
        </div>
        <ul className="space-y-1.5 mt-3">
          {[
            'Graduate research in digital media, social networks, and platform studies',
            'Thesis grounded in computational social science methods',
            'Background shapes product narrative and user mental model thinking',
          ].map((item, i) => (
            <li key={i} className="flex gap-2 text-xs text-white/60 leading-relaxed">
              <span className="shrink-0 mt-1.5 h-1 w-1 rounded-full bg-white/25" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-white/8" />

      {/* Notable achievements */}
      <div className="space-y-2.5">
        <p className="text-white/40 text-xs uppercase tracking-wider font-medium">
          Notable Achievements
        </p>
        <ul className="space-y-3">
          {[
            {
              title: 'Top 50 — Polymarket Builders Program',
              detail: 'Selected for top builder cohort with $200k–$300k/mo trading volume product',
            },
            {
              title: '27 Features Shipped at Binance',
              detail:
                'Delivered features across multiple surface areas at the world\'s largest crypto exchange',
            },
            {
              title: 'Sub-1s Data Latency (Hubble AI)',
              detail: 'Led architectural initiative that reduced on-chain data latency from 3–5s',
            },
          ].map((achievement, i) => (
            <li key={i} className="space-y-0.5">
              <p className="text-white/80 text-sm font-medium">{achievement.title}</p>
              <p className="text-white/50 text-xs leading-relaxed">{achievement.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function AboutApp({ instanceId, onClose, onMinimize, isFocused, isWindowed }: AppWindowProps) {
  const [activeSection, setActiveSection] = useState<Section>('overview')

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left sidebar */}
      <aside className="w-48 shrink-0 bg-[#252528] border-r border-white/[0.08] flex flex-col py-3 gap-0.5 overflow-y-auto">
        <p className="text-white/30 text-[10px] uppercase tracking-widest font-semibold px-4 pt-1 pb-2">
          Morris Yang
        </p>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={cn(
              'flex items-center gap-2.5 px-4 py-1.5 text-sm text-left w-full rounded-md mx-1 transition-colors duration-100',
              activeSection === item.id
                ? 'bg-blue-500/20 text-blue-400'
                : 'text-white/60 hover:text-white/80 hover:bg-white/5'
            )}
            style={{ width: 'calc(100% - 8px)' }}
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </aside>

      {/* Right content area */}
      <main className="flex-1 bg-[#1c1c1e] overflow-y-auto min-w-0">
        {activeSection === 'overview' && <OverviewSection />}
        {activeSection === 'experience' && <ExperienceSection />}
        {activeSection === 'skills' && <SkillsSection />}
        {activeSection === 'education' && <EducationSection />}
      </main>
    </div>
  )
}

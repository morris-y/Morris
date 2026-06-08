'use client'

import React from 'react'
import {
  NotebookPen,
  Film,
  MonitorPlay,
  SquareTerminal,
  Fingerprint,
  AtSign,
  Smartphone,
} from 'lucide-react'
import type { AppDefinition, AppWindowProps } from '@/types/window'
import type { AppId } from '@/types/window'

const NotesApp = React.lazy(() =>
  import('@/components/apps/notes-app').then((m) => ({ default: m.NotesApp }))
)

const ProjectsApp = React.lazy(() =>
  import('@/components/apps/projects-app').then((m) => ({ default: m.ProjectsApp }))
)

const TerminalApp = React.lazy(() =>
  import('@/components/apps/terminal-app').then((m) => ({ default: m.TerminalApp }))
)

const AboutApp = React.lazy(() =>
  import('@/components/apps/about-app').then((m) => ({ default: m.AboutApp }))
)

const ContactApp = React.lazy(() =>
  import('@/components/apps/contact-app').then((m) => ({ default: m.ContactApp }))
)

const ReelApp = React.lazy(() =>
  import('@/components/apps/reel-app').then((m) => ({ default: m.ReelApp }))
)

const NetflixApp = React.lazy(() =>
  import('@/components/apps/netflix-app').then((m) => ({ default: m.NetflixApp }))
)

/*
 * Icon design system
 * Every gradient is a radial-ellipse spotlight from ~top-left, giving each
 * squircle a 3-D lit-from-above feel rather than a flat 2-stop linear strip.
 * Three colour stops: highlight → midtone → deep shadow.
 */
export const appRegistry: AppDefinition[] = [
  {
    id: 'notes',
    name: 'Notes',
    icon: '📝',
    // Warm amber — Apple Notes signature gold, depth via dark burnt-sienna base
    gradientCss:
      'radial-gradient(ellipse at 38% 28%, #FFE566 0%, #F5A000 52%, #C06A00 100%)',
    Glyph: NotebookPen,
    iconConfig: {
      background: 'radial-gradient(ellipse at 36% 28%, #C4976A 0%, #9A7040 50%, #6A4820 100%)',
      texture:
        'repeating-radial-gradient(circle at 20% 30%, rgba(0,0,0,0.12) 0px, transparent 2px, transparent 7px), ' +
        'repeating-radial-gradient(circle at 65% 58%, rgba(0,0,0,0.10) 0px, transparent 1.5px, transparent 6px)',
      symbol: (s) => (
        <svg width={Math.round(s * 0.46)} height={Math.round(s * 0.46)} viewBox="0 0 22 22" fill="none">
          <rect x="2" y="1" width="18" height="20" rx="1.5" fill="rgba(255,255,255,0.92)" />
          <line x1="5" y1="7" x2="17" y2="7" stroke="rgba(160,110,60,0.55)" strokeWidth="1.1" />
          <line x1="5" y1="11" x2="17" y2="11" stroke="rgba(160,110,60,0.55)" strokeWidth="1.1" />
          <line x1="5" y1="15" x2="13" y2="15" stroke="rgba(160,110,60,0.55)" strokeWidth="1.1" />
        </svg>
      ),
    },
    description: 'Thoughts & writing',
    windowConstraints: {
      defaultSize: { width: 900, height: 600 },
      minSize: { width: 500, height: 400 },
    },
    component: NotesApp as React.ComponentType<AppWindowProps>,
  },
  {
    id: 'projects',
    name: 'Projects',
    icon: '🎬',
    // Deep cinematic red — director's-cut film energy
    gradientCss:
      'radial-gradient(ellipse at 40% 28%, #FF7070 0%, #E0192C 48%, #8A0C1A 100%)',
    Glyph: Film,
    iconConfig: {
      background: 'radial-gradient(ellipse at 40% 28%, #2A2435 0%, #0E0C14 52%, #050308 100%)',
      texture:
        'repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 4px), ' +
        'repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 4px)',
      symbol: (s) => {
        const w = Math.round(s * 0.46)
        const h = Math.round(s * 0.42)
        return (
          <svg width={w} height={h} viewBox="0 0 22 20" fill="none">
            <rect x="1" y="7" width="20" height="12" rx="1.5" fill="rgba(255,255,255,0.90)" />
            <rect x="1" y="1" width="20" height="7" rx="1" fill="rgba(255,255,255,0.90)" />
            <path d="M5 1 L2 8" stroke="rgba(20,20,30,0.75)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M9 1 L6 8" stroke="rgba(20,20,30,0.75)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M13 1 L10 8" stroke="rgba(20,20,30,0.75)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M17 1 L14 8" stroke="rgba(20,20,30,0.75)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M21 1 L18 8" stroke="rgba(20,20,30,0.75)" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        )
      },
    },
    description: 'Portfolio showcase',
    windowConstraints: {
      defaultSize: { width: 1000, height: 650 },
      minSize: { width: 600, height: 400 },
    },
    component: ProjectsApp as React.ComponentType<AppWindowProps>,
  },
  {
    id: 'netflix',
    name: 'Netflix',
    icon: '🍿',
    // Iconic Netflix red over deep cinema black — the streaming-app signature
    gradientCss:
      'radial-gradient(ellipse at 40% 26%, #FF5A5F 0%, #E50914 44%, #6B0008 100%)',
    Glyph: MonitorPlay,
    description: 'Morris, the series',
    windowConstraints: {
      defaultSize: { width: 1040, height: 680 },
      minSize: { width: 680, height: 460 },
    },
    component: NetflixApp as React.ComponentType<AppWindowProps>,
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: '⌨️',
    // Deep obsidian green — hacker aesthetic, dark but with a living warmth
    gradientCss:
      'radial-gradient(ellipse at 42% 30%, #2D6A45 0%, #0F3320 52%, #04120A 100%)',
    Glyph: SquareTerminal,
    iconConfig: {
      background: 'radial-gradient(ellipse at 40% 30%, #3A4A5A 0%, #1C2530 52%, #0A1018 100%)',
      texture:
        'repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 3px)',
      symbol: (s) => (
        <span
          style={{
            fontFamily: '"SF Mono", "Fira Code", "Fira Mono", monospace',
            fontSize: `${Math.round(s * 0.27)}px`,
            fontWeight: 700,
            color: '#30D158',
            letterSpacing: '-0.04em',
          }}
        >
          $_
        </span>
      ),
      glowColor: 'rgba(48, 209, 88, 0.75)',
    },
    description: 'Morris.exe',
    windowConstraints: {
      defaultSize: { width: 680, height: 440 },
      minSize: { width: 400, height: 300 },
    },
    component: TerminalApp as React.ComponentType<AppWindowProps>,
  },
  {
    id: 'about',
    name: 'About',
    icon: '🧑‍💻',
    // Rich violet/indigo — distinctive, personal identity feel (fingerprint icon)
    gradientCss:
      'radial-gradient(ellipse at 38% 28%, #C084FC 0%, #7C3AED 50%, #3B1277 100%)',
    Glyph: Fingerprint,
    iconConfig: {
      background: 'radial-gradient(ellipse at 38% 28%, #88BBFF 0%, #2060CC 45%, #0C1E80 100%)',
      texture:
        'radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.0) 55%)',
      symbol: (s) => (
        <span
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            fontSize: `${Math.round(s * 0.44)}px`,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.95)',
            letterSpacing: '-0.02em',
            textShadow: '0 1px 3px rgba(0,0,0,0.4)',
          }}
        >
          M
        </span>
      ),
    },
    description: 'Background & experience',
    windowConstraints: {
      defaultSize: { width: 760, height: 580 },
      minSize: { width: 500, height: 400 },
    },
    component: AboutApp as React.ComponentType<AppWindowProps>,
  },
  {
    id: 'contact',
    name: 'Contact',
    icon: '📬',
    // Vivid cyan/teal — open, communicative, not generic green
    gradientCss:
      'radial-gradient(ellipse at 38% 30%, #38EFD0 0%, #0B9E84 50%, #045048 100%)',
    Glyph: AtSign,
    iconConfig: {
      background: 'radial-gradient(ellipse at 38% 30%, #2E8A3C 0%, #1B5624 52%, #0C2E12 100%)',
      texture:
        'repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 4px), ' +
        'repeating-linear-gradient(-45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 4px)',
      symbol: (s) => {
        const w = Math.round(s * 0.46)
        const h = Math.round(s * 0.38)
        return (
          <svg width={w} height={h} viewBox="0 0 22 18" fill="none">
            <rect x="1" y="3" width="20" height="14" rx="1.5" fill="rgba(255,255,255,0.92)" />
            <path d="M1 3 L11 10 L21 3" stroke="rgba(20,90,30,0.6)" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
          </svg>
        )
      },
    },
    description: 'Get in touch',
    windowConstraints: {
      defaultSize: { width: 480, height: 380 },
      minSize: { width: 380, height: 300 },
    },
    component: ContactApp as React.ComponentType<AppWindowProps>,
  },
  {
    id: 'reel',
    name: 'Reel',
    icon: '🌀',
    // TikTok hot-pink → deep violet — unmistakably "the algorithm sent me"
    gradientCss:
      'radial-gradient(ellipse at 40% 26%, #FF6EC7 0%, #E8185C 42%, #7B00B4 100%)',
    Glyph: Smartphone,
    iconConfig: {
      background: 'radial-gradient(ellipse at 42% 30%, #E060C8 0%, #9020A8 45%, #3C086C 100%)',
      texture:
        'repeating-conic-gradient(rgba(255,255,255,0.06) 0deg 15deg, transparent 15deg 30deg), ' +
        'radial-gradient(circle at 50% 50%, rgba(210,190,230,0.22) 0%, rgba(210,190,230,0.22) 8%, transparent 8.5%)',
      symbol: (s) => {
        const w = Math.round(s * 0.46)
        const h = Math.round(s * 0.32)
        return (
          <svg width={w} height={h} viewBox="0 0 22 14" fill="none">
            <path
              d="M1 7 C3 3, 5 3, 7 7 C9 11, 11 11, 13 7 C15 3, 17 3, 19 7 C20 9, 21 9, 21 7"
              stroke="rgba(255,255,255,0.92)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
      },
    },
    description: 'The algorithm sent me',
    windowConstraints: {
      defaultSize: { width: 420, height: 760 },
      minSize: { width: 360, height: 560 },
    },
    component: ReelApp as React.ComponentType<AppWindowProps>,
  },
]

export function getAppById(id: AppId): AppDefinition | undefined {
  return appRegistry.find((app) => app.id === id)
}

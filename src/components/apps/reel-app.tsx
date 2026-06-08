'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowUpRight,
  Bookmark,
  ChevronDown,
  Heart,
  Mail,
  MessageCircle,
  Music,
  PenLine,
  Plus,
  Share2,
} from 'lucide-react'
import type { AppWindowProps } from '@/types/window'
import { experience, projects, siteConfig, skills } from '@/lib/content'

/* ------------------------------------------------------------------ */
/* brand glyphs — lucide 1.x dropped brand icons, so inline the SVGs   */
/* (drop-in: accept a `size` prop like a lucide icon)                  */
/* ------------------------------------------------------------------ */

function XGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.733-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  )
}

function LinkedInGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function GitHubGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* palette — each card gets a distinct-but-harmonious bloom set        */
/* ------------------------------------------------------------------ */

interface Hue {
  /** base deep wash, bottom-to-top */
  base: string
  /** primary bloom rgba */
  bloomA: string
  /** secondary bloom rgba */
  bloomB: string
  /** accent for chrome/glow */
  accent: string
}

const HUES = {
  violet: {
    base: 'linear-gradient(165deg, #1a0b2e 0%, #0c0617 70%, #050308 100%)',
    bloomA: 'rgba(150,60,230,0.42)',
    bloomB: 'rgba(225,70,150,0.20)',
    accent: '#b06bff',
  },
  magenta: {
    base: 'linear-gradient(165deg, #2a0a26 0%, #140513 68%, #060206 100%)',
    bloomA: 'rgba(236,72,153,0.46)',
    bloomB: 'rgba(160,60,230,0.22)',
    accent: '#ff6bc1',
  },
  indigo: {
    base: 'linear-gradient(165deg, #0e1238 0%, #080a1d 70%, #04040a 100%)',
    bloomA: 'rgba(99,102,241,0.46)',
    bloomB: 'rgba(168,85,247,0.22)',
    accent: '#7c8bff',
  },
  teal: {
    base: 'linear-gradient(165deg, #07221f 0%, #08111c 68%, #040608 100%)',
    bloomA: 'rgba(45,212,191,0.40)',
    bloomB: 'rgba(124,92,255,0.24)',
    accent: '#39e0c8',
  },
  blue: {
    base: 'linear-gradient(165deg, #06183a 0%, #060e22 70%, #04060e 100%)',
    bloomA: 'rgba(10,132,255,0.46)',
    bloomB: 'rgba(120,80,240,0.22)',
    accent: '#3aa0ff',
  },
  rose: {
    base: 'linear-gradient(165deg, #2a0a1c 0%, #150510 68%, #060205 100%)',
    bloomA: 'rgba(244,63,94,0.44)',
    bloomB: 'rgba(168,85,247,0.20)',
    accent: '#ff6b8a',
  },
} satisfies Record<string, Hue>

type HueKey = keyof typeof HUES

/* ------------------------------------------------------------------ */
/* animated bloom background (breathing + slow parallax drift)         */
/* ------------------------------------------------------------------ */

function CardBackground({ hue, active }: { hue: Hue; active: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ background: hue.base }}
    >
      <motion.div
        className="absolute -inset-[20%]"
        style={{
          background: `radial-gradient(ellipse 55% 48% at 32% 30%, ${hue.bloomA} 0%, transparent 62%)`,
        }}
        animate={
          active
            ? { scale: [1, 1.18, 1], x: ['-2%', '4%', '-2%'], opacity: [0.85, 1, 0.85] }
            : { scale: 1, opacity: 0.7 }
        }
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -inset-[20%]"
        style={{
          background: `radial-gradient(ellipse 50% 46% at 72% 76%, ${hue.bloomB} 0%, transparent 60%)`,
        }}
        animate={
          active
            ? { scale: [1.1, 1, 1.1], y: ['2%', '-4%', '2%'], opacity: [0.55, 0.9, 0.55] }
            : { scale: 1, opacity: 0.45 }
        }
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
      />
      {/* fine grain + vignette for that filmic feed depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 120% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)',
        }}
      />
      {/* legibility scrim top + bottom (where chrome lives) */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/65 to-transparent" />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* right rail — TikTok action stack                                    */
/* ------------------------------------------------------------------ */

function RailButton({
  children,
  label,
  onClick,
  active,
  accent,
}: {
  children: ReactNode
  label?: string
  onClick?: () => void
  active?: boolean
  accent?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center gap-1 outline-none"
    >
      <motion.span
        whileTap={{ scale: 0.78 }}
        whileHover={{ scale: 1.08 }}
        className="grid h-11 w-11 place-items-center rounded-full transition-colors"
        style={{
          color: active && accent ? accent : 'rgba(255,255,255,0.96)',
          filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.55))',
        }}
      >
        {children}
      </motion.span>
      {label !== undefined && (
        <span
          className="text-[11px] font-semibold tabular-nums text-white/90"
          style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
        >
          {label}
        </span>
      )}
    </button>
  )
}

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`
  return `${n}`
}

function RightRail({
  hue,
  baseLikes,
  baseComments,
  avatar,
  active = true,
}: {
  hue: Hue
  baseLikes: number
  baseComments: number
  avatar?: ReactNode
  active?: boolean
}) {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [burst, setBurst] = useState(0)
  const likes = baseLikes + (liked ? 1 : 0)

  return (
    <div className="absolute bottom-24 right-2.5 z-20 flex flex-col items-center gap-5">
      {/* spinning record / avatar with follow plus */}
      <div className="relative mb-1">
        <motion.div
          className="grid h-12 w-12 place-items-center overflow-hidden rounded-full border-2 border-white/85"
          style={{
            background: `conic-gradient(from 0deg, ${hue.accent}, #ffffff22, ${hue.accent})`,
            boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
          }}
          animate={active ? { rotate: 360 } : { rotate: 0 }}
          transition={
            active
              ? { duration: 8, repeat: Infinity, ease: 'linear' }
              : { duration: 0.3 }
          }
        >
          <div className="grid h-[38px] w-[38px] place-items-center rounded-full bg-black/55 backdrop-blur-sm">
            {avatar ?? <span className="text-sm font-bold text-white">MY</span>}
          </div>
        </motion.div>
        <span
          className="absolute -bottom-1.5 left-1/2 grid h-5 w-5 -translate-x-1/2 place-items-center rounded-full text-white"
          style={{ background: '#fe2c55', boxShadow: '0 2px 6px rgba(0,0,0,0.4)' }}
        >
          <Plus size={12} strokeWidth={3.2} />
        </span>
      </div>

      <div className="relative">
        <RailButton
          label={likes.toLocaleString()}
          active={liked}
          accent="#fe2c55"
          onClick={() => {
            setLiked((v) => !v)
            if (!liked) setBurst((b) => b + 1)
          }}
        >
          <Heart size={29} fill={liked ? '#fe2c55' : 'transparent'} strokeWidth={2} />
        </RailButton>
        {/* floating heart burst */}
        <AnimatePresence>
          {burst > 0 && (
            <motion.span
              key={burst}
              className="pointer-events-none absolute left-1/2 top-1.5 -translate-x-1/2"
              initial={{ opacity: 0.9, y: 0, scale: 0.6 }}
              animate={{ opacity: 0, y: -46, scale: 1.3 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            >
              <Heart size={22} fill="#fe2c55" color="#fe2c55" />
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <RailButton label={formatCount(baseComments)}>
        <MessageCircle size={29} strokeWidth={2} />
      </RailButton>

      <RailButton
        label="Save"
        active={saved}
        accent={hue.accent}
        onClick={() => setSaved((v) => !v)}
      >
        <Bookmark size={28} fill={saved ? hue.accent : 'transparent'} strokeWidth={2} />
      </RailButton>

      <RailButton
        label="Share"
        onClick={() => {
          if (siteConfig.socials.x) window.open(siteConfig.socials.x, '_blank', 'noopener')
        }}
      >
        <Share2 size={27} strokeWidth={2} />
      </RailButton>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* bottom-left caption block + music ticker                            */
/* ------------------------------------------------------------------ */

function CaptionBlock({
  caption,
  extra,
  active = true,
}: {
  caption: ReactNode
  extra?: ReactNode
  active?: boolean
}) {
  return (
    <div className="absolute bottom-7 left-4 right-20 z-20 select-none">
      <div className="mb-1.5 flex items-center gap-2">
        <span
          className="text-[15px] font-bold text-white"
          style={{ textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}
        >
          @morrisyang
        </span>
        <span className="rounded-full border border-white/40 px-1.5 py-px text-[10px] font-medium text-white/85">
          Follow
        </span>
      </div>
      <div
        className="text-[13px] leading-snug text-white/90"
        style={{ textShadow: '0 1px 5px rgba(0,0,0,0.55)' }}
      >
        {caption}
      </div>
      {extra}
      {/* music ticker */}
      <div className="mt-2.5 flex items-center gap-2 overflow-hidden">
        <Music size={14} className="shrink-0 text-white/90" />
        <div className="relative h-4 flex-1 overflow-hidden">
          <motion.div
            className="absolute whitespace-nowrap text-[12px] text-white/80"
            animate={active ? { x: ['0%', '-50%'] } : { x: '0%' }}
            transition={active ? { duration: 12, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
          >
            original sound — the algorithm sent me&nbsp;&nbsp;·&nbsp;&nbsp;original
            sound — the algorithm sent me&nbsp;&nbsp;·&nbsp;&nbsp;
          </motion.div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* card shell + staged content                                         */
/* ------------------------------------------------------------------ */

const reveal = {
  hidden: { opacity: 0, y: 22, filter: 'blur(6px)' },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { delay: 0.12 + i * 0.11, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

function Stage({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <motion.div
      className="relative z-10 flex h-full w-full flex-col justify-center px-6 pb-44 pt-14"
      variants={{ show: { transition: { staggerChildren: 0.04 } } }}
      initial="hidden"
      animate={active ? 'show' : 'hidden'}
    >
      {children}
    </motion.div>
  )
}

function Line({ i = 0, children }: { i?: number; children: ReactNode }) {
  return (
    <motion.div custom={i} variants={reveal}>
      {children}
    </motion.div>
  )
}

interface CardProps {
  hue: Hue
  active: boolean
  index: number
  registerRef: (i: number, el: HTMLElement | null) => void
  likes: number
  comments: number
  caption: ReactNode
  children: ReactNode
  captionExtra?: ReactNode
}

function Card({
  hue,
  active,
  index,
  registerRef,
  likes,
  comments,
  caption,
  captionExtra,
  children,
}: CardProps) {
  return (
    <section
      ref={(el) => registerRef(index, el)}
      data-index={index}
      className="relative h-full w-full shrink-0 snap-start overflow-hidden"
    >
      <CardBackground hue={hue} active={active} />
      <Stage active={active}>{children}</Stage>
      <RightRail hue={hue} baseLikes={likes} baseComments={comments} active={active} />
      <CaptionBlock caption={caption} extra={captionExtra} active={active} />
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* small shared pieces                                                 */
/* ------------------------------------------------------------------ */

function SocialPill({
  href,
  icon,
  label,
}: {
  href: string
  icon: ReactNode
  label: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur-md transition-colors hover:bg-white/20"
    >
      {icon}
      {label}
    </a>
  )
}

/* counts down from `from` → `to` while the card is active */
function CountdownNumber({
  active,
  from,
  to,
}: {
  active: boolean
  from: number
  to: number
}) {
  const [val, setVal] = useState(from)
  useEffect(() => {
    if (!active) {
      setVal(from)
      return
    }
    const start = performance.now()
    const dur = 1500
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(from + (to - from) * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, from, to])
  return <span className="tabular-nums">{val.toFixed(1)}</span>
}

/* ------------------------------------------------------------------ */
/* main component                                                      */
/* ------------------------------------------------------------------ */

const SKILL_COLOR: Record<string, { bg: string; border: string; text: string }> = {
  domain: { bg: 'rgba(10,132,255,0.18)', border: 'rgba(10,132,255,0.55)', text: '#9ccbff' },
  tech: { bg: 'rgba(150,80,255,0.18)', border: 'rgba(150,80,255,0.55)', text: '#c8a8ff' },
  tools: { bg: 'rgba(45,212,191,0.16)', border: 'rgba(45,212,191,0.5)', text: '#8ff0df' },
}

export function ReelApp({ isFocused }: AppWindowProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  // build the card list once (order matters)
  type Slide = {
    hue: HueKey
    likes: number
    comments: number
    caption: ReactNode
    captionExtra?: ReactNode
    render: (active: boolean) => ReactNode
  }

  const résumé = useMemo(() => {
    const binance = experience.find((e) => e.company === 'Binance')
    const gate = experience.find((e) => e.company === 'Gate.io')
    const hubble = experience.find((e) => e.role === 'Senior Product Manager')
    return [hubble, binance, gate].filter(Boolean) as typeof experience
  }, [])

  const slides = useMemo<Slide[]>(() => {
    const list: Slide[] = []

    /* 1 — INTRO */
    list.push({
      hue: 'violet',
      likes: 12400,
      comments: 318,
      caption: <>building at the edge of AI × on-chain data 🛰️ swipe up for the story</>,
      captionExtra: (
        <div className="mt-2 flex flex-wrap gap-2">
          {siteConfig.socials.x && (
            <SocialPill href={siteConfig.socials.x} icon={<XGlyph size={13} />} label="X" />
          )}
          {siteConfig.socials.linkedin && (
            <SocialPill
              href={siteConfig.socials.linkedin}
              icon={<LinkedInGlyph size={13} />}
              label="LinkedIn"
            />
          )}
          {siteConfig.socials.github && (
            <SocialPill
              href={siteConfig.socials.github}
              icon={<GitHubGlyph size={13} />}
              label="GitHub"
            />
          )}
        </div>
      ),
      render: (active) => (
        <>
          <Line i={0}>
            <span className="text-[13px] font-semibold uppercase tracking-[0.3em] text-white/55">
              the algorithm sent me
            </span>
          </Line>
          <Line i={1}>
            <h1 className="mt-3 text-[52px] font-extrabold leading-[0.95] tracking-tight text-white">
              Morris
              <br />
              Yang
            </h1>
          </Line>
          <Line i={2}>
            <p className="mt-4 max-w-[15rem] text-[15px] font-medium leading-snug text-white/85">
              {siteConfig.tagline}
            </p>
          </Line>
          <Line i={3}>
            <motion.div
              className="mt-7 flex items-center gap-2 text-[13px] font-semibold text-white/75"
              animate={active ? { y: [0, 7, 0] } : {}}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown size={18} /> swipe up
            </motion.div>
          </Line>
        </>
      ),
    })

    /* 2 — STAT DROP */
    list.push({
      hue: 'magenta',
      likes: 28900,
      comments: 642,
      caption: (
        <>
          monthly trading volume · 2 months · 2-person team — prediction markets terminal @
          Hubble AI
        </>
      ),
      render: () => (
        <>
          <Line i={0}>
            <span className="text-[13px] font-semibold uppercase tracking-[0.28em] text-white/55">
              the stat that hits different
            </span>
          </Line>
          <Line i={1}>
            <div
              className="mt-3 bg-gradient-to-br from-white to-white/70 bg-clip-text text-[64px] font-black leading-[0.9] tracking-tight text-transparent"
              style={{ filter: 'drop-shadow(0 6px 24px rgba(236,72,153,0.4))' }}
            >
              $200K
              <br />
              –$300K
            </div>
          </Line>
          <Line i={2}>
            <p className="mt-4 text-[15px] font-medium text-white/85">
              monthly trading volume,
              <br />
              shipped within 2 months.
            </p>
          </Line>
          <Line i={3}>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white backdrop-blur-md">
              👥 2-person team
            </div>
          </Line>
        </>
      ),
    })

    /* 3 — FLEX / badge */
    list.push({
      hue: 'indigo',
      likes: 19200,
      comments: 411,
      caption: <>selected into a builder cohort alongside the best on prediction markets 🏆</>,
      render: () => (
        <>
          <Line i={0}>
            <span className="text-[13px] font-semibold uppercase tracking-[0.28em] text-white/55">
              certified
            </span>
          </Line>
          <Line i={1}>
            <div className="mt-4 flex flex-col items-start">
              <motion.div
                className="relative rounded-3xl border border-white/25 px-6 py-5 backdrop-blur-md"
                style={{ background: 'rgba(124,139,255,0.12)' }}
                animate={{
                  boxShadow: [
                    '0 0 26px rgba(124,139,255,0.35)',
                    '0 0 52px rgba(124,139,255,0.6)',
                    '0 0 26px rgba(124,139,255,0.35)',
                  ],
                }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="text-[60px] font-black leading-none tracking-tight text-white">
                  Top 50
                </div>
                <div className="mt-1 text-[15px] font-semibold text-white/85">
                  Polymarket Builders Program
                </div>
              </motion.div>
            </div>
          </Line>
          <Line i={2}>
            <p className="mt-5 max-w-[15rem] text-[14px] leading-snug text-white/80">
              one of fifty teams worldwide recognised for building on prediction markets.
            </p>
          </Line>
        </>
      ),
    })

    /* 4 — BEFORE → AFTER latency */
    list.push({
      hue: 'teal',
      likes: 15700,
      comments: 287,
      caption: <>Solana-first data architecture — we made it disappear ⚡</>,
      render: (active) => (
        <>
          <Line i={0}>
            <span className="text-[13px] font-semibold uppercase tracking-[0.28em] text-white/55">
              latency speedrun
            </span>
          </Line>
          <Line i={1}>
            <div className="mt-4 flex items-end gap-3">
              <span className="text-[34px] font-bold leading-none text-white/45 line-through decoration-white/30">
                3–5s
              </span>
              <span className="pb-1 text-[20px] font-bold text-white/70">→</span>
            </div>
          </Line>
          <Line i={2}>
            <div
              className="mt-1 flex items-baseline text-[72px] font-black leading-none tracking-tight text-white"
              style={{ filter: 'drop-shadow(0 6px 22px rgba(45,212,191,0.45))' }}
            >
              <CountdownNumber active={active} from={5} to={0.9} />
              <span className="text-[40px]">s</span>
            </div>
          </Line>
          <Line i={3}>
            <p className="mt-3 text-[15px] font-semibold text-white">sub-1s, end to end.</p>
          </Line>
        </>
      ),
    })

    /* 5 — PROJECTS */
    const projectHues: HueKey[] = ['blue', 'violet']
    projects.forEach((p, pi) => {
      list.push({
        hue: projectHues[pi % projectHues.length],
        likes: 9300 + pi * 1200,
        comments: 176 + pi * 40,
        caption: <>{p.outcomes}</>,
        captionExtra: p.url ? (
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 rounded-full bg-white px-3.5 py-1.5 text-[12px] font-bold text-black transition-transform hover:scale-105"
          >
            View <ArrowUpRight size={14} />
          </a>
        ) : undefined,
        render: () => (
          <>
            <Line i={0}>
              <span className="text-[13px] font-semibold uppercase tracking-[0.28em] text-white/55">
                shipped · project {pi + 1}
              </span>
            </Line>
            <Line i={1}>
              <h2 className="mt-3 text-[34px] font-extrabold leading-[1.02] tracking-tight text-white">
                {p.title}
              </h2>
            </Line>
            <Line i={2}>
              <p className="mt-3 max-w-[17rem] text-[14px] leading-snug text-white/85">
                {p.description}
              </p>
            </Line>
            <Line i={3}>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {p.techStack.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Line>
          </>
        ),
      })
    })

    /* 6 — RÉSUMÉ highlights */
    list.push({
      hue: 'rose',
      likes: 11800,
      comments: 233,
      caption: <>the receipts — a few stops on the way here 📍</>,
      render: () => (
        <>
          <Line i={0}>
            <span className="text-[13px] font-semibold uppercase tracking-[0.28em] text-white/55">
              the receipts
            </span>
          </Line>
          <div className="mt-4 flex flex-col gap-3">
            {résumé.map((e, ei) => (
              <Line key={`${e.company}-${ei}`} i={ei + 1}>
                <div className="rounded-2xl border border-white/15 bg-white/[0.07] px-4 py-3 backdrop-blur-md">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[17px] font-bold text-white">{e.company}</span>
                    <span className="text-[11px] text-white/55">{e.role}</span>
                  </div>
                  <p className="mt-1 text-[13px] leading-snug text-white/85">{e.bullets[0]}</p>
                </div>
              </Line>
            ))}
          </div>
        </>
      ),
    })

    /* 7 — SKILLS */
    list.push({
      hue: 'violet',
      likes: 8700,
      comments: 154,
      caption: <>the stack behind the work — domain · tech · tools 🧰</>,
      render: (active) => (
        <>
          <Line i={0}>
            <span className="text-[13px] font-semibold uppercase tracking-[0.28em] text-white/55">
              the toolkit
            </span>
          </Line>
          <Line i={1}>
            <h2 className="mt-2 text-[32px] font-extrabold leading-tight tracking-tight text-white">
              14 things I&apos;m
              <br />
              fluent in
            </h2>
          </Line>
          <div className="mt-5 flex max-w-[19rem] flex-wrap gap-2">
            {skills.map((s, si) => {
              const c = SKILL_COLOR[s.category]
              return (
                <motion.span
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.6, y: 10 }}
                  animate={active ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.6 }}
                  transition={{
                    delay: 0.35 + si * 0.045,
                    type: 'spring',
                    stiffness: 380,
                    damping: 22,
                  }}
                  className="rounded-full border px-3 py-1.5 text-[12px] font-semibold"
                  style={{ background: c.bg, borderColor: c.border, color: c.text }}
                >
                  {s.label}
                </motion.span>
              )
            })}
          </div>
        </>
      ),
    })

    /* 8 — EDUCATION / origin */
    list.push({
      hue: 'indigo',
      likes: 6400,
      comments: 98,
      caption: <>comms brain, product hands — narrative is half the build 🎓</>,
      render: () => (
        <>
          <Line i={0}>
            <span className="text-[13px] font-semibold uppercase tracking-[0.28em] text-white/55">
              origin story
            </span>
          </Line>
          <Line i={1}>
            <div className="mt-3 text-[40px] font-black leading-[1.0] tracking-tight text-white">
              MA · Communications
            </div>
          </Line>
          <Line i={2}>
            <div className="mt-2 text-[18px] font-semibold text-white/80">
              National Chengchi University
            </div>
          </Line>
          <Line i={3}>
            <p className="mt-5 max-w-[16rem] text-[14px] leading-snug text-white/85">
              a communications background is my edge — it shapes how I think about product
              narrative and user mental models.
            </p>
          </Line>
        </>
      ),
    })

    /* 9 — OUTRO / CTA */
    list.push({
      hue: 'magenta',
      likes: 31200,
      comments: 880,
      caption: <>thanks for scrolling — let&apos;s build something 💜</>,
      render: (active) => (
        <>
          <Line i={0}>
            <motion.div
              className="grid h-16 w-16 place-items-center overflow-hidden rounded-full border-2 border-white/85"
              style={{
                background: 'conic-gradient(from 0deg, #ff6bc1, #ffffff33, #ff6bc1)',
              }}
              animate={active ? { rotate: 360 } : {}}
              transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
            >
              <div className="grid h-[54px] w-[54px] place-items-center rounded-full bg-black/55">
                <span className="text-lg font-bold text-white">MY</span>
              </div>
            </motion.div>
          </Line>
          <Line i={1}>
            <h2 className="mt-4 text-[34px] font-extrabold leading-tight tracking-tight text-white">
              Based in Taipei.
              <br />
              Open to remote
              <br />
              or relocation.
            </h2>
          </Line>
          <Line i={2}>
            <p className="mt-3 text-[14px] text-white/80">follow for more product builds 👇</p>
          </Line>
          <Line i={3}>
            <div className="mt-4 flex flex-wrap gap-2">
              <SocialPill
                href={`mailto:${siteConfig.email}`}
                icon={<Mail size={13} />}
                label="Email"
              />
              {siteConfig.socials.x && (
                <SocialPill href={siteConfig.socials.x} icon={<XGlyph size={13} />} label="X" />
              )}
              {siteConfig.socials.linkedin && (
                <SocialPill
                  href={siteConfig.socials.linkedin}
                  icon={<LinkedInGlyph size={13} />}
                  label="LinkedIn"
                />
              )}
              {siteConfig.socials.github && (
                <SocialPill
                  href={siteConfig.socials.github}
                  icon={<GitHubGlyph size={13} />}
                  label="GitHub"
                />
              )}
              {siteConfig.socials.medium && (
                <SocialPill
                  href={siteConfig.socials.medium}
                  icon={<PenLine size={13} />}
                  label="Medium"
                />
              )}
            </div>
          </Line>
        </>
      ),
    })

    return list
  }, [résumé])

  const registerRef = useCallback((i: number, el: HTMLElement | null) => {
    cardRefs.current[i] = el
  }, [])

  // track active card via IntersectionObserver
  useEffect(() => {
    const root = containerRef.current
    if (!root) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.55) {
            const idx = Number((entry.target as HTMLElement).dataset.index)
            if (!Number.isNaN(idx)) setActiveIndex(idx)
          }
        })
      },
      { root, threshold: [0.55, 0.8] }
    )
    cardRefs.current.forEach((el) => el && obs.observe(el))
    return () => obs.disconnect()
  }, [slides.length])

  const goTo = useCallback((i: number) => {
    const clamped = Math.max(0, Math.min(cardRefs.current.length - 1, i))
    cardRefs.current[clamped]?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // keyboard nav — only when the window is focused
  useEffect(() => {
    if (!isFocused) return
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault()
        goTo(activeIndex + 1)
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault()
        goTo(activeIndex - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isFocused, activeIndex, goTo])

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {/* feed */}
      <div
        ref={containerRef}
        className="scrollbar-none h-full w-full snap-y snap-mandatory overflow-y-scroll overscroll-contain"
      >
        {slides.map((s, i) => (
          <Card
            key={i}
            hue={HUES[s.hue]}
            active={i === activeIndex}
            index={i}
            registerRef={registerRef}
            likes={s.likes}
            comments={s.comments}
            caption={s.caption}
            captionExtra={s.captionExtra}
          >
            {s.render(i === activeIndex)}
          </Card>
        ))}
      </div>

      {/* top brand bar — sits above the feed, very subtle */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-center gap-5 pt-3 text-[13px] font-semibold">
        <span className="text-white/45">Following</span>
        <span className="relative text-white">
          For You
          <span className="absolute -bottom-1.5 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-white" />
        </span>
      </div>

      {/* right-edge progress rail */}
      <div className="pointer-events-none absolute right-1 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-1.5">
        {slides.map((_, i) => (
          <motion.span
            key={i}
            className="block w-1 rounded-full"
            animate={{
              height: i === activeIndex ? 18 : 6,
              backgroundColor:
                i === activeIndex ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)',
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        ))}
      </div>
    </div>
  )
}

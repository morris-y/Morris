'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from 'motion/react'
import {
  Play,
  Plus,
  Check,
  ThumbsUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  Search,
  X,
  Award,
  Volume2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  siteConfig,
  projects,
  experience,
  skills,
  type Project,
  type ExperienceItem,
  type Skill,
} from '@/lib/content'
import type { AppWindowProps } from '@/types/window'

/* -------------------------------------------------------------------------- */
/*  Palette                                                                    */
/* -------------------------------------------------------------------------- */

const RED = '#E50914'
const GREEN = '#46d369'
const BG = '#141414'

/* -------------------------------------------------------------------------- */
/*  Title model — every catalog entry normalises to this shape                 */
/* -------------------------------------------------------------------------- */

type TitleKind = 'film' | 'series' | 'stat' | 'genre' | 'continue'

interface Title {
  id: string
  kind: TitleKind
  /** Primary line on the card thumbnail */
  name: string
  /** Smaller line under the name (role / company / caption) */
  subtitle?: string
  /** Long-form blurb shown in hover panel + detail overlay */
  synopsis: string
  /** Genre / tech chips */
  tags: string[]
  match: number
  year: string
  rating: string
  /** "Cast" — for series this is role @ company */
  cast?: string[]
  url?: string
  /** Episode list (experience bullets) shown in the detail overlay */
  episodes?: string[]
  /** Cinematic gradient for the thumbnail / hero band */
  gradient: string
  /** Big number for stat tiles */
  bigStat?: string
  /** TOP-10 rank numeral, if ranked */
  rank?: number
  /** Continue-watching progress 0..1 */
  progress?: number
  /** Pill shown top-left of the thumbnail (e.g. LIMITED SERIES) */
  flag?: string
}

/* -------------------------------------------------------------------------- */
/*  Deterministic gradient generator (no real images available)               */
/* -------------------------------------------------------------------------- */

const GRADIENTS = [
  'linear-gradient(135deg,#3a0d12 0%,#7d1620 45%,#14090b 100%)',
  'linear-gradient(135deg,#1c1c1f 0%,#3a2a2c 50%,#0f0f10 100%)',
  'linear-gradient(135deg,#2a0c10 0%,#5a1118 50%,#120708 100%)',
  'linear-gradient(135deg,#0d2a1f 0%,#15633f 50%,#0a1812 100%)',
  'linear-gradient(135deg,#26181a 0%,#4a2a2d 50%,#141011 100%)',
  'linear-gradient(135deg,#1f1f22 0%,#3a3030 45%,#101011 100%)',
  'linear-gradient(135deg,#3a0d18 0%,#7d1530 50%,#180a10 100%)',
]

function gradFor(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  return GRADIENTS[Math.abs(h) % GRADIENTS.length]
}

/* Award-forward dark-crimson gradients for the TOP-10 achievement tiles */
const STAT_GRADIENTS = [
  'linear-gradient(135deg,#5a0c14 0%,#9a1620 45%,#1a090b 100%)',
  'linear-gradient(135deg,#3a0d14 0%,#7d1620 50%,#160809 100%)',
  'linear-gradient(135deg,#4a0e12 0%,#8a1422 45%,#180809 100%)',
  'linear-gradient(135deg,#330b12 0%,#6b1320 50%,#13070a 100%)',
  'linear-gradient(135deg,#5a1018 0%,#a01828 45%,#1a0a0d 100%)',
]

const CATEGORY_TINT: Record<Skill['category'], string> = {
  domain: 'linear-gradient(135deg,#4a0d12 0%,#9a1620 100%)',
  tech: 'linear-gradient(135deg,#1f1f22 0%,#3a2a2c 100%)',
  tools: 'linear-gradient(135deg,#0d3a2a 0%,#15805a 100%)',
}

const CATEGORY_BORDER: Record<Skill['category'], string> = {
  domain: 'rgba(229,9,20,0.55)',
  tech: 'rgba(229,9,20,0.35)',
  tools: 'rgba(70,211,105,0.55)',
}

/* -------------------------------------------------------------------------- */
/*  Build the catalog from real content                                        */
/* -------------------------------------------------------------------------- */

/**
 * Maturity-rating gag that actually carries signal: senior roles read SR-PM,
 * research/writing reads RESEARCH, everything else is a plain IC "PM".
 */
function ratingForRole(role: string): string {
  const r = role.toLowerCase()
  if (r.includes('research') || r.includes('writer')) return 'RESEARCH'
  if (r.includes('senior') || r.includes('lead') || r.includes('head'))
    return 'SR-PM'
  return 'PM'
}

function projectToTitle(p: Project, i: number): Title {
  return {
    id: `proj-${i}`,
    kind: 'film',
    name: p.title,
    subtitle: p.outcomes,
    synopsis: p.description,
    tags: p.techStack,
    match: i === 0 ? 98 : 96,
    year: '2026',
    rating: i === 0 ? 'SR-PM' : 'PM',
    cast: ['Morris Yang — Senior Product Manager', 'Hubble AI'],
    url: p.url,
    episodes: p.techStack.map((t) => `Built on ${t}`),
    gradient: gradFor(p.title),
    flag: i === 0 ? 'LIMITED SERIES' : 'NEW',
  }
}

function experienceToTitle(e: ExperienceItem, i: number): Title {
  const year = e.dateRange.match(/\b(20\d{2})\b/)?.[1] ?? ''
  return {
    id: `exp-${i}`,
    kind: 'series',
    name: e.company,
    subtitle: e.role,
    synopsis: e.description,
    tags: [e.role],
    match: 95 - i * 2,
    year,
    rating: ratingForRole(e.role),
    cast: [`Morris Yang — ${e.role}`, e.company],
    episodes: e.bullets,
    gradient: gradFor(e.company + e.role),
    flag: i === 0 ? 'NOW STREAMING' : undefined,
  }
}

interface StatSeed {
  big: string
  name: string
  caption: string
  cast: string
}

const STAT_SEEDS: StatSeed[] = [
  {
    big: '$200K–$300K',
    name: 'Monthly Trading Volume',
    caption:
      'Prediction markets terminal reached $200k–$300k in monthly trading volume within two months of launch — built with a two-person team.',
    cast: 'Hubble AI — Senior Product Manager',
  },
  {
    big: 'Top 50',
    name: 'Polymarket Builders',
    caption:
      'Selected into the Top 50 of the Polymarket Builders Program for the AI-powered trading terminal.',
    cast: 'Polymarket Builders Program',
  },
  {
    big: '27 Features',
    name: 'Shipped at Binance',
    caption:
      'Shipped 27 product features across multiple surface areas at the world’s largest crypto exchange, improving localization and error-message quality.',
    cast: 'Binance — Product Manager (Contract)',
  },
  {
    big: '3–5s → sub-1s',
    name: 'Data Latency',
    caption:
      'Drove a Solana-first data architecture that cut on-chain data latency from 3–5 seconds to sub-1 second across the platform.',
    cast: 'Hubble AI — Product Manager & QA',
  },
  {
    big: '15+ Reports',
    name: 'Research Published',
    caption:
      'Published 15+ research reports covering ZK Proofs, Coprocessors, SocialFi, AI, Data, GameFi, and Account Abstraction.',
    cast: 'Gate.io — Researcher & Technical Writer',
  },
]

function statToTitle(s: StatSeed, i: number): Title {
  return {
    id: `stat-${i}`,
    kind: 'stat',
    name: s.name,
    bigStat: s.big,
    subtitle: s.caption,
    synopsis: s.caption,
    tags: ['Achievement', 'Critics’ Pick'],
    match: 99 - i,
    year: '2026',
    rating: ratingForRole(s.cast),
    cast: [s.cast],
    gradient: STAT_GRADIENTS[i % STAT_GRADIENTS.length],
    rank: i + 1,
    flag: i === 0 ? 'AWARD WINNER' : undefined,
  }
}

interface ContinueSeed {
  name: string
  synopsis: string
  tags: string[]
  progress: number
}

const CONTINUE_SEEDS: ContinueSeed[] = [
  {
    name: 'Building in Public',
    synopsis:
      'An ongoing saga of shipping fast, sharing the journey, and turning product narrative into momentum.',
    tags: ['Go-to-Market', 'Product Narrative'],
    progress: 0.8,
  },
  {
    name: 'On-chain Data',
    synopsis:
      'Sub-second Solana-first data infrastructure powering dashboards, APIs, and AI agents.',
    tags: ['On-chain Data', 'Solana', 'MCP'],
    progress: 0.6,
  },
  {
    name: 'AI Agents',
    synopsis:
      'AI-assisted trading workflows and agent tooling at the edge of prediction markets.',
    tags: ['AI Agents', 'Prediction Markets'],
    progress: 0.4,
  },
]

function continueToTitle(c: ContinueSeed, i: number): Title {
  return {
    id: `cont-${i}`,
    kind: 'continue',
    name: c.name,
    subtitle: 'Ongoing theme',
    synopsis: c.synopsis,
    tags: c.tags,
    match: 90 - i * 3,
    year: '2026',
    rating: 'PM',
    cast: ['Morris Yang'],
    gradient: gradFor(c.name),
    progress: c.progress,
  }
}

/* -------------------------------------------------------------------------- */
/*  Small UI atoms                                                              */
/* -------------------------------------------------------------------------- */

function MatchBadge({ value }: { value: number }) {
  return (
    <span className="text-[11px] font-semibold" style={{ color: GREEN }}>
      {value}% Match
    </span>
  )
}

function MaturityBox({ rating }: { rating: string }) {
  return (
    <span className="border border-white/40 px-1.5 py-px text-[10px] font-medium text-white/80 leading-none">
      {rating}
    </span>
  )
}

function HdBadge() {
  return (
    <span className="border border-white/30 rounded px-1 text-[9px] font-semibold tracking-wide text-white/60 leading-tight">
      HD
    </span>
  )
}

/**
 * Truthful "awarded" ranking pill. Keeps the premium Netflix red-chip look but
 * carries a real, source-backed label (no fabricated "#1 / TOP 10" claim).
 */
function TopRankPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-sm bg-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/85">
      <span
        className="grid h-4 w-4 place-items-center rounded-[2px] text-white"
        style={{ background: RED }}
      >
        <Award className="h-2.5 w-2.5" />
      </span>
      {label}
    </span>
  )
}

function OriginalMark() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] text-white/70">
      <span
        className="block h-3.5 w-[3px] rounded-full"
        style={{ background: RED }}
      />
      ORIGINAL
    </span>
  )
}

function RoundIconButton({
  children,
  label,
  primary,
  active,
  onClick,
}: {
  children: ReactNode
  label: string
  primary?: boolean
  active?: boolean
  onClick?: (e: React.MouseEvent) => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'grid h-7 w-7 place-items-center rounded-full border transition-colors',
        primary
          ? 'bg-white text-black border-white hover:bg-white/85'
          : active
            ? 'border-white bg-white/15 text-white'
            : 'border-white/40 bg-black/30 text-white/85 hover:border-white'
      )}
    >
      {children}
    </button>
  )
}

function TagChips({
  tags,
  max = 4,
}: {
  tags: string[]
  max?: number
}) {
  const shown = tags.slice(0, max)
  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] text-white/65">
      {shown.map((t, i) => (
        <span key={t} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-white/30">•</span>}
          {t}
        </span>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Hover-expand card                                                           */
/* -------------------------------------------------------------------------- */

interface CardProps {
  title: Title
  onOpen: (t: Title) => void
  inMyList: boolean
  onToggleList: (id: string) => void
  reduced: boolean
}

function Thumbnail({ title }: { title: Title }) {
  const isStat = title.kind === 'stat'
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: title.gradient }}
    >
      {/* texture / vignette */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(120% 80% at 80% 10%, rgba(255,255,255,0.16), transparent 60%)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      {/* progress bar for continue-watching */}
      {typeof title.progress === 'number' && (
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/20">
          <div
            className="h-full"
            style={{ width: `${title.progress * 100}%`, background: RED }}
          />
        </div>
      )}

      {/* flag pill */}
      {title.flag && (
        <span
          className="absolute left-2 top-2 rounded-[3px] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white"
          style={{ background: 'rgba(0,0,0,0.55)' }}
        >
          <span style={{ color: RED }}>● </span>
          {title.flag}
        </span>
      )}

      {/* content */}
      <div className="absolute inset-0 flex flex-col justify-end p-3">
        {isStat ? (
          <>
            <Award className="mb-1 h-4 w-4 text-white/55" />
            <span className="text-[26px] font-display font-extrabold leading-none text-white drop-shadow">
              {title.bigStat}
            </span>
            <span className="mt-1 text-[11px] font-medium text-white/75">
              {title.name}
            </span>
          </>
        ) : (
          <>
            {title.kind === 'series' && (
              <span className="mb-1 inline-flex">
                <OriginalMark />
              </span>
            )}
            <span className="text-sm font-bold leading-tight text-white drop-shadow">
              {title.name}
            </span>
            {title.subtitle && (
              <span className="mt-0.5 line-clamp-1 text-[10px] text-white/70">
                {title.subtitle}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function HoverCard({
  title,
  onOpen,
  inMyList,
  onToggleList,
  reduced,
}: CardProps) {
  const [hovered, setHovered] = useState(false)
  const [liked, setLiked] = useState(false)
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const open = useCallback(() => onOpen(title), [onOpen, title])

  const handleEnter = () => {
    if (reduced) return
    enterTimer.current = setTimeout(() => setHovered(true), 280)
  }
  const handleLeave = () => {
    if (enterTimer.current) clearTimeout(enterTimer.current)
    setHovered(false)
  }

  useEffect(
    () => () => {
      if (enterTimer.current) clearTimeout(enterTimer.current)
    },
    []
  )

  return (
    <div
      className="relative shrink-0"
      style={{ width: 200 }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* base card keeps layout height stable */}
      <div className="aspect-video w-full overflow-hidden rounded-md">
        <button
          type="button"
          onClick={open}
          className="block h-full w-full text-left"
          aria-label={`Open ${title.name}`}
        >
          <Thumbnail title={title} />
        </button>
      </div>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: -28 }}
            exit={{ opacity: 0, scale: 0.92, y: 0, transition: { duration: 0.12 } }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="absolute left-1/2 top-0 z-50 origin-center -translate-x-1/2 overflow-hidden rounded-md shadow-2xl shadow-black/80"
            style={{ width: 280 }}
            onClick={open}
          >
            {/* enlarged thumb */}
            <div className="aspect-video w-full overflow-hidden">
              <Thumbnail title={title} />
            </div>

            {/* info panel */}
            <div className="space-y-2 bg-[#181818] p-3">
              <div className="flex items-center gap-1.5">
                <RoundIconButton
                  label="Play"
                  primary
                  onClick={(e) => {
                    e.stopPropagation()
                    if (title.url)
                      window.open(title.url, '_blank', 'noopener,noreferrer')
                    else open()
                  }}
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                </RoundIconButton>
                <RoundIconButton
                  label={inMyList ? 'Remove from My List' : 'Add to My List'}
                  active={inMyList}
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleList(title.id)
                  }}
                >
                  {inMyList ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                </RoundIconButton>
                <RoundIconButton
                  label="Rate"
                  active={liked}
                  onClick={(e) => {
                    e.stopPropagation()
                    setLiked((v) => !v)
                  }}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                </RoundIconButton>
                <div className="ml-auto">
                  <RoundIconButton
                    label="More info"
                    onClick={(e) => {
                      e.stopPropagation()
                      open()
                    }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </RoundIconButton>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MatchBadge value={title.match} />
                <MaturityBox rating={title.rating} />
                <HdBadge />
                <span className="text-[10px] text-white/45">{title.year}</span>
              </div>

              <TagChips tags={title.tags} />

              <p className="line-clamp-2 text-[11px] leading-relaxed text-white/80">
                {title.synopsis}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Ranked (TOP 10) card — giant numeral beside the poster                     */
/* -------------------------------------------------------------------------- */

function RankedCard(props: CardProps) {
  const rank = props.title.rank ?? 0
  return (
    <div className="flex shrink-0 items-end" style={{ width: 270 }}>
      <span
        className="-mr-3 select-none font-black leading-none"
        style={{
          fontSize: 110,
          color: 'transparent',
          WebkitTextStroke: '3px rgba(255,255,255,0.22)',
          lineHeight: 0.8,
        }}
        aria-hidden
      >
        {rank}
      </span>
      <HoverCard {...props} />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Genre tile (skills)                                                         */
/* -------------------------------------------------------------------------- */

function GenreTile({
  skill,
  active,
  onClick,
}: {
  skill: Skill
  active: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'relative flex h-20 w-44 shrink-0 items-center overflow-hidden rounded-md px-4 text-left',
        active && 'ring-2 ring-white'
      )}
      style={{
        background: CATEGORY_TINT[skill.category],
        boxShadow: active
          ? `0 0 0 1px ${CATEGORY_BORDER[skill.category]}`
          : 'inset 0 0 0 1px rgba(255,255,255,0.06)',
      }}
    >
      <span
        className="absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(100% 100% at 100% 0%, rgba(255,255,255,0.18), transparent 55%)',
        }}
      />
      <span className="relative text-sm font-bold leading-tight text-white drop-shadow">
        {skill.label}
      </span>
      <span className="absolute bottom-1.5 right-2 text-[8px] font-semibold uppercase tracking-widest text-white/45">
        {skill.category}
      </span>
    </motion.button>
  )
}

/* -------------------------------------------------------------------------- */
/*  Row — horizontal strip with hover chevrons                                  */
/* -------------------------------------------------------------------------- */

const SCROLL_STEP = 560

function Row({
  title,
  badge,
  children,
  rowRef,
}: {
  title: string
  badge?: ReactNode
  children: ReactNode
  rowRef?: (el: HTMLDivElement | null) => void
}) {
  const stripRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)

  const scrollBy = (dir: 1 | -1) => {
    stripRef.current?.scrollBy({ left: dir * SCROLL_STEP, behavior: 'smooth' })
  }

  return (
    <section
      ref={rowRef}
      className="relative scroll-mt-20 py-3"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="mb-2 flex items-center gap-2 px-4 md:px-12">
        <h2 className="text-base font-display font-bold tracking-display text-white/90 md:text-lg">
          {title}
        </h2>
        {badge}
      </div>

      <div className="group/row relative">
        {/* left chevron */}
        <AnimatePresence>
          {hovered && (
            <motion.button
              type="button"
              aria-label="Scroll left"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => scrollBy(-1)}
              className="absolute left-0 top-0 z-40 hidden h-full w-10 items-center justify-center bg-gradient-to-r from-black/70 to-transparent text-white/80 hover:text-white md:flex"
            >
              <ChevronLeft className="h-7 w-7" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* the strip — x scroll, but visible vertically so hover-expand can lift */}
        <div
          ref={stripRef}
          className="scrollbar-none flex gap-2.5 overflow-x-auto overflow-y-visible px-4 pb-6 pt-3 md:px-12"
          style={{ scrollSnapType: 'x proximity' }}
        >
          {children}
        </div>

        {/* right chevron */}
        <AnimatePresence>
          {hovered && (
            <motion.button
              type="button"
              aria-label="Scroll right"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => scrollBy(1)}
              className="absolute right-0 top-0 z-40 hidden h-full w-10 items-center justify-center bg-gradient-to-l from-black/70 to-transparent text-white/80 hover:text-white md:flex"
            >
              <ChevronRight className="h-7 w-7" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*  Billboard hero                                                              */
/* -------------------------------------------------------------------------- */

function Billboard({
  title,
  reduced,
  isFocused,
  onMoreInfo,
}: {
  title: Title
  reduced: boolean
  isFocused: boolean
  onMoreInfo: () => void
}) {
  const breathe: Variants = {
    animate: {
      scale: [1.04, 1.09, 1.04],
      transition: { duration: 18, repeat: Infinity, ease: [0.4, 0, 0.6, 1] },
    },
    rest: { scale: 1.04 },
  }

  // Pause the perpetual breathe loop while the window is unfocused/occluded so
  // it doesn't keep animating (and repainting) off-screen.
  const breatheState = reduced || !isFocused ? 'rest' : 'animate'
  const eyebrow =
    title.kind === 'series' ? 'MORRISFLIX ORIGINAL SERIES' : 'MORRISFLIX FILM'

  return (
    <div className="relative h-[58%] min-h-[360px] w-full overflow-hidden">
      {/* cinematic background */}
      <motion.div
        className="absolute inset-0"
        style={{ background: title.gradient }}
        variants={breathe}
        animate={breatheState}
      >
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(120% 90% at 75% 15%, rgba(255,255,255,0.18), transparent 55%)',
          }}
        />
      </motion.div>

      {/* scrims: left for text legibility, bottom fade into page */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/45 to-transparent" />
      <div
        className="absolute inset-x-0 bottom-0 h-44"
        style={{
          background: `linear-gradient(to top, ${BG} 8%, rgba(20,20,20,0.4) 55%, transparent)`,
        }}
      />

      {/* content */}
      <div className="absolute inset-0 flex flex-col justify-end px-4 pb-16 md:px-12 md:pb-20">
        <div className="max-w-xl">
          <span className="mb-3 inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.3em] text-white/70">
            <span className="h-4 w-[3px]" style={{ background: RED }} />
            {eyebrow}
          </span>

          <h1 className="text-3xl font-display font-black tracking-display-tight leading-display-tight text-white drop-shadow-lg md:text-5xl">
            {title.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <MatchBadge value={title.match} />
            <TopRankPill label="Top 50 · Polymarket Builders" />
            <span className="text-[11px] text-white/55">{title.year}</span>
            <HdBadge />
            <MaturityBox rating={title.rating} />
            <span className="rounded-sm border border-white/25 px-1.5 py-px text-[10px] font-medium text-white/70">
              {title.flag}
            </span>
          </div>

          <p className="mt-3 line-clamp-2 max-w-md text-sm leading-relaxed text-white/80 md:line-clamp-3 md:text-base">
            {title.synopsis}
          </p>

          <div className="mt-5 flex items-center gap-3">
            {title.url && (
              <a
                href={title.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded bg-white px-5 py-2 text-sm font-bold text-black transition-colors hover:bg-white/85"
              >
                <Play className="h-4 w-4 fill-current" />
                Play
              </a>
            )}
            <button
              type="button"
              onClick={onMoreInfo}
              className="inline-flex items-center gap-2 rounded bg-white/20 px-5 py-2 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/30"
            >
              <Info className="h-4 w-4" />
              More Info
            </button>

            <div className="ml-1 hidden items-center gap-3 md:flex">
              <span className="grid h-9 w-9 place-items-center rounded-full border border-white/40 text-white/70">
                <Volume2 className="h-4 w-4" />
              </span>
              <span className="border-l-[3px] border-white/50 py-1 pl-2 pr-3 text-[11px] font-medium text-white/80">
                {title.rating}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Detail overlay ("More Info")                                               */
/* -------------------------------------------------------------------------- */

function DetailOverlay({
  title,
  onClose,
  inMyList,
  onToggleList,
}: {
  title: Title
  onClose: () => void
  inMyList: boolean
  onToggleList: (id: string) => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const isStat = title.kind === 'stat'

  return (
    <motion.div
      className="absolute inset-0 z-[80] flex items-start justify-center overflow-y-auto scrollbar-none p-4 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/75"
      />

      {/* panel */}
      <motion.div
        initial={{ y: 24, scale: 0.96, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 16, scale: 0.97, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="relative z-10 my-2 w-full max-w-xl overflow-hidden rounded-lg bg-[#181818] shadow-2xl shadow-black/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* hero band */}
        <div
          className="relative h-52 w-full"
          style={{ background: title.gradient }}
        >
          <div
            className="absolute inset-0 opacity-60"
            style={{
              background:
                'radial-gradient(120% 90% at 80% 10%, rgba(255,255,255,0.2), transparent 55%)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/20 to-transparent" />

          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-[#181818]/80 text-white/80 transition-colors hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="absolute inset-x-0 bottom-0 p-5">
            {title.kind === 'series' && (
              <span className="mb-1.5 inline-flex">
                <OriginalMark />
              </span>
            )}
            {isStat ? (
              <>
                <span className="text-4xl font-display font-black leading-none text-white drop-shadow">
                  {title.bigStat}
                </span>
                <h2 className="mt-1 text-lg font-display font-bold tracking-display text-white">
                  {title.name}
                </h2>
              </>
            ) : (
              <h2 className="text-2xl font-display font-black tracking-display leading-display text-white drop-shadow md:text-3xl">
                {title.name}
              </h2>
            )}

            <div className="mt-3 flex items-center gap-3">
              {title.url && (
                <a
                  href={title.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded bg-white px-5 py-1.5 text-sm font-bold text-black transition-colors hover:bg-white/85"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Play
                </a>
              )}
              <RoundIconButton
                label={inMyList ? 'Remove from My List' : 'Add to My List'}
                active={inMyList}
                onClick={() => onToggleList(title.id)}
              >
                {inMyList ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </RoundIconButton>
              <RoundIconButton label="Rate">
                <ThumbsUp className="h-4 w-4" />
              </RoundIconButton>
            </div>
          </div>
        </div>

        {/* body */}
        <div className="space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <MatchBadge value={title.match} />
            <span className="text-[12px] text-white/55">{title.year}</span>
            <MaturityBox rating={title.rating} />
            <HdBadge />
            {title.flag && (
              <span className="rounded-sm border border-white/25 px-1.5 py-px text-[10px] font-medium text-white/65">
                {title.flag}
              </span>
            )}
          </div>

          <p className="text-sm leading-relaxed text-white/80">
            {title.synopsis}
          </p>

          {/* episode list */}
          {title.episodes && title.episodes.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-bold text-white">
                {title.kind === 'series' ? 'Episodes' : 'Highlights'}
              </h3>
              <div className="space-y-1.5">
                {title.episodes.map((ep, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-md bg-white/[0.03] px-3 py-2"
                  >
                    <span className="w-4 shrink-0 text-sm font-bold text-white/35">
                      {i + 1}
                    </span>
                    <span className="text-[13px] leading-relaxed text-white/70">
                      {ep}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-x-6 gap-y-1 text-[12px] sm:grid-cols-2">
            {title.cast && title.cast.length > 0 && (
              <p className="text-white/45">
                <span className="text-white/35">Cast: </span>
                <span className="text-white/70">{title.cast.join(', ')}</span>
              </p>
            )}
            <p className="text-white/45">
              <span className="text-white/35">Genres: </span>
              <span className="text-white/70">{title.tags.join(', ')}</span>
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Nav bar                                                                     */
/* -------------------------------------------------------------------------- */

const NAV_LINKS = [
  { key: 'home', label: 'Home' },
  { key: 'projects', label: 'Projects' },
  { key: 'experience', label: 'Experience' },
  { key: 'skills', label: 'Skills' },
  { key: 'mylist', label: 'My List' },
] as const

type NavKey = (typeof NAV_LINKS)[number]['key']

function NavBar({
  scrolled,
  onNav,
  query,
  setQuery,
}: {
  scrolled: boolean
  onNav: (key: NavKey) => void
  query: string
  setQuery: (v: string) => void
}) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header
      className={cn(
        'sticky top-0 z-[70] flex h-14 items-center justify-between px-4 transition-colors duration-300 md:px-12',
        scrolled
          ? 'bg-[#141414]/95 backdrop-blur-sm'
          : 'bg-gradient-to-b from-black/80 to-transparent'
      )}
    >
      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={() => onNav('home')}
          className="text-lg font-black tracking-[0.02em] md:text-xl"
          style={{ color: RED }}
        >
          MORRISFLIX
        </button>
        <nav className="hidden items-center gap-4 md:flex">
          {NAV_LINKS.map((l) => (
            <button
              key={l.key}
              type="button"
              onClick={() => onNav(l.key)}
              className="text-[13px] text-white/75 transition-colors hover:text-white"
            >
              {l.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center">
          <AnimatePresence initial={false}>
            {searchOpen && (
              <motion.input
                key="search"
                autoFocus
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 160, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Titles, tech…"
                className="mr-2 h-8 rounded-sm border border-white/30 bg-black/70 px-2 text-[13px] text-white placeholder:text-white/35 focus:outline-none"
              />
            )}
          </AnimatePresence>
          <button
            type="button"
            aria-label="Search"
            onClick={() => {
              setSearchOpen((v) => {
                if (v) setQuery('')
                return !v
              })
            }}
            className="text-white/85 transition-colors hover:text-white"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>

        <div
          className="grid h-7 w-7 place-items-center rounded-[4px] text-[11px] font-bold text-white"
          style={{
            background: `linear-gradient(135deg,${RED},#7d1620)`,
          }}
        >
          MY
        </div>
      </div>
    </header>
  )
}

/* -------------------------------------------------------------------------- */
/*  Footer                                                                      */
/* -------------------------------------------------------------------------- */

function Footer() {
  const socials: Array<[string, string | undefined]> = [
    ['X', siteConfig.socials.x],
    ['LinkedIn', siteConfig.socials.linkedin],
    ['GitHub', siteConfig.socials.github],
    ['Medium', siteConfig.socials.medium],
  ]
  return (
    <footer className="px-4 pb-10 pt-8 md:px-12">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {socials.map(([label, href]) =>
            href ? (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-white/45 transition-colors hover:text-white/80"
              >
                {label}
              </a>
            ) : null
          )}
          <a
            href={`mailto:${siteConfig.email}`}
            className="text-[13px] text-white/45 transition-colors hover:text-white/80"
          >
            {siteConfig.email}
          </a>
        </div>
        <p className="text-[12px] text-white/30">
          MORRISFLIX — a career catalog by {siteConfig.name}. {siteConfig.tagline}
        </p>
      </div>
    </footer>
  )
}

/* -------------------------------------------------------------------------- */
/*  Root app                                                                    */
/* -------------------------------------------------------------------------- */

export function NetflixApp({ isFocused }: AppWindowProps) {
  const reduced = useReducedMotion() ?? false
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)

  const [active, setActive] = useState<Title | null>(null)
  const [myList, setMyList] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const [genreFilter, setGenreFilter] = useState<string | null>(null)

  // row refs for nav scroll
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const setRowRef = (key: string) => (el: HTMLDivElement | null) => {
    rowRefs.current[key] = el
  }

  // build catalog once
  const projectTitles = useMemo(() => projects.map(projectToTitle), [])
  const seriesTitles = useMemo(() => experience.map(experienceToTitle), [])
  const statTitles = useMemo(() => STAT_SEEDS.map(statToTitle), [])
  const continueTitles = useMemo(() => CONTINUE_SEEDS.map(continueToTitle), [])
  const hero = projectTitles[0]

  const myListTitles = useMemo(() => {
    const all = [
      ...projectTitles,
      ...seriesTitles,
      ...statTitles,
      ...continueTitles,
    ]
    return all.filter((t) => myList.has(t.id))
  }, [projectTitles, seriesTitles, statTitles, continueTitles, myList])

  // search predicate
  const q = query.trim().toLowerCase()
  const matchQuery = useCallback(
    (t: Title) => {
      if (!q) return true
      return (
        t.name.toLowerCase().includes(q) ||
        (t.subtitle?.toLowerCase().includes(q) ?? false) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
      )
    },
    [q]
  )

  // genre predicate (skills row click)
  const matchGenre = useCallback(
    (t: Title) => {
      if (!genreFilter) return true
      const g = genreFilter.toLowerCase()
      return (
        t.tags.some((tag) => tag.toLowerCase().includes(g)) ||
        t.name.toLowerCase().includes(g) ||
        t.synopsis.toLowerCase().includes(g)
      )
    },
    [genreFilter]
  )

  const filterRow = useCallback(
    (list: Title[]) => list.filter((t) => matchQuery(t) && matchGenre(t)),
    [matchQuery, matchGenre]
  )

  const filtering = q.length > 0 || genreFilter !== null

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => setScrolled(el.scrollTop > 40)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const toggleList = useCallback((id: string) => {
    setMyList((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleNav = useCallback((key: NavKey) => {
    if (key === 'home') {
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    rowRefs.current[key]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }, [])

  const cardCommon = (t: Title) => ({
    title: t,
    onOpen: setActive,
    inMyList: myList.has(t.id),
    onToggleList: toggleList,
    reduced,
  })

  const trending = filterRow(projectTitles)
  const originals = filterRow(seriesTitles)
  const picks = filterRow(statTitles)
  const continueRow = filterRow(continueTitles)

  const rootStyle: CSSProperties = { backgroundColor: BG }

  return (
    <div
      ref={scrollRef}
      style={rootStyle}
      className="scrollbar-none relative h-full w-full overflow-y-auto text-white"
    >
      <NavBar
        scrolled={scrolled}
        onNav={handleNav}
        query={query}
        setQuery={setQuery}
      />

      {/* hero only when not actively searching/filtering */}
      {!filtering && hero && (
        <Billboard
          title={hero}
          reduced={reduced}
          isFocused={isFocused}
          onMoreInfo={() => setActive(hero)}
        />
      )}

      <div className={cn('relative z-10 pb-2', !filtering && '-mt-10')}>
        {filtering && (
          <div className="px-4 pt-6 md:px-12">
            <p className="text-sm text-white/55">
              {q ? (
                <>
                  Results for{' '}
                  <span className="font-semibold text-white">“{query}”</span>
                </>
              ) : (
                <>
                  Genre:{' '}
                  <span className="font-semibold text-white">{genreFilter}</span>
                </>
              )}
              {genreFilter && (
                <button
                  type="button"
                  onClick={() => setGenreFilter(null)}
                  className="ml-3 text-[12px] text-white/45 underline-offset-2 hover:text-white hover:underline"
                >
                  Clear
                </button>
              )}
            </p>
          </div>
        )}

        {/* Trending Now */}
        {trending.length > 0 && (
          <Row title="Trending Now" rowRef={setRowRef('projects')}>
            {trending.map((t) => (
              <HoverCard key={t.id} {...cardCommon(t)} />
            ))}
          </Row>
        )}

        {/* MORRIS Originals */}
        {originals.length > 0 && (
          <Row
            title="MORRIS Originals"
            badge={<OriginalMark />}
            rowRef={setRowRef('experience')}
          >
            {originals.map((t) => (
              <HoverCard key={t.id} {...cardCommon(t)} />
            ))}
          </Row>
        )}

        {/* Critics' Picks · Achievements (TOP 10 treatment) */}
        {picks.length > 0 && (
          <Row title="Critics’ Picks · Achievements">
            {picks.map((t) => (
              <RankedCard key={t.id} {...cardCommon(t)} />
            ))}
          </Row>
        )}

        {/* Genres You're Into — skills */}
        {!q && (
          <section
            ref={setRowRef('skills')}
            className="relative scroll-mt-20 py-3"
          >
            <div className="mb-2 px-4 md:px-12">
              <h2 className="text-base font-display font-bold tracking-display text-white/90 md:text-lg">
                Genres You’re Into
              </h2>
            </div>
            <div className="scrollbar-none flex gap-2.5 overflow-x-auto px-4 pb-4 md:px-12">
              {skills.map((s) => (
                <GenreTile
                  key={s.label}
                  skill={s}
                  active={genreFilter === s.label}
                  onClick={() =>
                    setGenreFilter((prev) =>
                      prev === s.label ? null : s.label
                    )
                  }
                />
              ))}
            </div>
          </section>
        )}

        {/* Continue Watching for Morris */}
        {continueRow.length > 0 && (
          <Row title="Continue Watching for Morris">
            {continueRow.map((t) => (
              <HoverCard key={t.id} {...cardCommon(t)} />
            ))}
          </Row>
        )}

        {/* My List */}
        {myListTitles.length > 0 && (
          <Row title="My List" rowRef={setRowRef('mylist')}>
            {myListTitles.map((t) => (
              <HoverCard key={`my-${t.id}`} {...cardCommon(t)} />
            ))}
          </Row>
        )}

        {/* empty-state when filter yields nothing */}
        {filtering &&
          trending.length === 0 &&
          originals.length === 0 &&
          picks.length === 0 &&
          continueRow.length === 0 && (
            <div className="px-4 py-16 text-center md:px-12">
              <p className="text-white/60">
                No titles match your search. Try another term.
              </p>
            </div>
          )}

        <Footer />
      </div>

      {/* detail overlay */}
      <AnimatePresence>
        {active && (
          <DetailOverlay
            key={active.id}
            title={active}
            onClose={() => setActive(null)}
            inMyList={myList.has(active.id)}
            onToggleList={toggleList}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

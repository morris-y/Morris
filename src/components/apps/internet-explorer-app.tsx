'use client'

import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Calendar,
  ExternalLink,
  Globe2,
  Home,
  Link2,
  RotateCcw,
  Search,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type MockTone = 'ancient' | 'future'

const QUICK_LINKS = [
  { label: 'Apple', url: 'https://www.apple.com' },
  { label: 'Yahoo', url: 'https://www.yahoo.com' },
  { label: 'NASA', url: 'https://www.nasa.gov' },
  { label: 'The Web', url: 'https://www.w3.org' },
]

const CURRENT_YEAR = new Date().getFullYear()

function normalizeUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return 'https://www.apple.com'
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function archiveUrl(url: string, year: number) {
  return `https://web.archive.org/web/${year}0101000000/${normalizeUrl(url)}`
}

function getHost(url: string) {
  try {
    return new URL(normalizeUrl(url)).host.replace(/^www\./, '')
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0] || 'unknown-site.net'
  }
}

function MockSite({ url, year }: { url: string; year: number }) {
  const tone: MockTone = year < 1996 ? 'ancient' : 'future'
  const host = getHost(url)
  const seed = Array.from(host).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const issueNumber = (seed % 87) + 12
  const latency = tone === 'ancient' ? `${(seed % 8) + 2}.8kbps` : `${(seed % 40) + 8}Tbps`
  const sections =
    tone === 'ancient'
      ? ['Home Page', 'Guest Book', 'FTP Mirror', 'Site Map']
      : ['Signal', 'Identity', 'Memory', 'Archive']

  return (
    <div
      className={cn(
        'h-full overflow-auto p-5 text-sm',
        tone === 'ancient'
          ? 'bg-[#d9d1aa] text-[#171104]'
          : 'bg-[#05070b] text-cyan-50'
      )}
    >
      <div
        className={cn(
          'mx-auto min-h-full max-w-4xl border p-4 shadow-2xl',
          tone === 'ancient'
            ? 'border-[#6a5b2f] bg-[#eee4b8] shadow-[#5d4f29]/30'
            : 'border-cyan-300/30 bg-[#07131c] shadow-cyan-900/40'
        )}
      >
        <div
          className={cn(
            'mb-4 flex flex-wrap items-center justify-between gap-3 border-b pb-3',
            tone === 'ancient' ? 'border-[#6a5b2f]' : 'border-cyan-300/20'
          )}
        >
          <div>
            <p className={cn('text-[10px] uppercase', tone === 'ancient' ? 'tracking-[0.16em]' : '')}>
              AI-generated style mock
            </p>
            <h1
              className={cn(
                'font-display text-3xl font-black leading-none',
                tone === 'ancient' ? 'text-[#30230b]' : 'text-cyan-100'
              )}
            >
              {host}
            </h1>
          </div>
          <div
            className={cn(
              'border px-3 py-2 font-mono text-xs',
              tone === 'ancient'
                ? 'border-[#6a5b2f] bg-[#fff7cf]'
                : 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100'
            )}
          >
            YEAR {year} / LINK {latency}
          </div>
        </div>

        <div
          className={cn(
            'mb-5 grid grid-cols-2 gap-2 border p-2 text-xs sm:grid-cols-4',
            tone === 'ancient'
              ? 'border-[#6a5b2f] bg-[#cbbf8d]'
              : 'border-cyan-300/20 bg-cyan-950/30'
          )}
        >
          {sections.map((section) => (
            <button
              key={section}
              className={cn(
                'border px-2 py-1 text-left transition-colors',
                tone === 'ancient'
                  ? 'border-[#6a5b2f] bg-[#fff7cf] hover:bg-white'
                  : 'border-cyan-300/25 bg-black/20 hover:bg-cyan-300/10'
              )}
            >
              {section}
            </button>
          ))}
        </div>

        {tone === 'ancient' ? (
          <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
            <section className="border border-[#6a5b2f] bg-[#fff7cf] p-4">
              <h2 className="mb-2 font-display text-xl font-bold">Welcome to our Internet outpost</h2>
              <p className="leading-relaxed">
                This reconstructed page imagines how {host} might have looked before the public
                web had enough archived pages to browse. Expect hand-coded tables, download links,
                and a webmaster who updates things late on Friday.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 font-mono text-[11px]">
                {['new.gif', 'mail me', 'links', `issue-${issueNumber}`].map((item) => (
                  <span key={item} className="border border-[#6a5b2f] bg-[#e3d79f] px-2 py-1">
                    {item}
                  </span>
                ))}
              </div>
            </section>
            <aside className="space-y-3 border border-[#6a5b2f] bg-[#cbbf8d] p-4">
              <p className="font-mono text-xs">Visitor counter</p>
              <p className="border border-[#6a5b2f] bg-black px-3 py-2 font-mono text-lg text-lime-300">
                000{seed * 7}
              </p>
              <p className="text-xs leading-relaxed">
                No archive is available before 1996, so this page is generated locally as a period
                styled placeholder.
              </p>
            </aside>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
            <aside className="space-y-3 border border-cyan-300/20 bg-black/25 p-4">
              <p className="text-xs uppercase text-cyan-200/70">Future archive synthesis</p>
              <div className="h-28 overflow-hidden rounded border border-cyan-300/20 bg-[radial-gradient(circle_at_30%_20%,rgba(103,232,249,0.35),transparent_35%),linear-gradient(135deg,rgba(8,47,73,0.8),rgba(6,78,59,0.45))]" />
              <p className="text-xs leading-relaxed text-cyan-50/70">
                Future years cannot be fetched from the Wayback Machine, so this is a speculative
                local mock using the address as its design seed.
              </p>
            </aside>
            <section className="border border-cyan-300/20 bg-cyan-950/20 p-4">
              <h2 className="font-display text-3xl font-black leading-tight text-cyan-50">
                {host} persistent memory node
              </h2>
              <p className="mt-3 max-w-2xl leading-relaxed text-cyan-50/75">
                The {year} edition of this site presents adaptive identity, ambient navigation,
                and archive-aware content cards. The live web has not reached this date, but the
                explorer can still sketch the mood.
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                {['Neural cache', 'Consent layer', 'Time bridge'].map((item) => (
                  <div key={item} className="border border-cyan-300/20 bg-black/25 p-3">
                    <p className="text-sm font-semibold">{item}</p>
                    <p className="mt-1 text-xs text-cyan-50/55">status: generated</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

export function InternetExplorerApp() {
  const [address, setAddress] = useState('https://www.apple.com')
  const [submittedUrl, setSubmittedUrl] = useState('https://www.apple.com')
  const [year, setYear] = useState(2001)
  const [reloadKey, setReloadKey] = useState(0)

  const useMock = year < 1996 || year > CURRENT_YEAR
  const archived = useMemo(() => archiveUrl(submittedUrl, year), [submittedUrl, year])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmittedUrl(normalizeUrl(address))
    setReloadKey((key) => key + 1)
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#b9c4d4] text-[#111827]">
      <form
        onSubmit={submit}
        className="shrink-0 border-b border-[#6d7f95] bg-[#d9e2ef] p-2 shadow-inner"
      >
        <div className="mb-2 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setAddress('https://www.apple.com')
              setSubmittedUrl('https://www.apple.com')
              setYear(2001)
            }}
            className="grid h-8 w-8 place-items-center rounded border border-[#8da0b8] bg-[#edf3fa] text-[#20324b] shadow-sm hover:bg-white"
            title="Home"
          >
            <Home size={15} />
          </button>
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="grid h-8 w-8 place-items-center rounded border border-[#8da0b8] bg-[#edf3fa] text-[#20324b] shadow-sm hover:bg-white"
            title="Reload"
          >
            <RotateCcw size={15} />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded border border-[#8293aa] bg-white px-2">
            <Globe2 size={15} className="shrink-0 text-[#315a8a]" />
            <input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className="h-8 min-w-0 flex-1 bg-transparent text-sm outline-none"
              placeholder="https://example.com"
            />
          </div>
          <label className="flex h-8 items-center gap-1.5 rounded border border-[#8293aa] bg-white px-2 text-xs">
            <Calendar size={14} className="text-[#315a8a]" />
            <input
              value={year}
              onChange={(event) => setYear(Number(event.target.value) || 1996)}
              className="w-16 bg-transparent font-mono outline-none"
              type="number"
              min={1980}
              max={CURRENT_YEAR + 50}
            />
          </label>
          <button
            type="submit"
            className="flex h-8 items-center gap-1.5 rounded bg-[#1f5fba] px-3 text-xs font-semibold text-white shadow-sm hover:bg-[#174d9b]"
          >
            <Search size={14} />
            Go
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          <span className="flex items-center gap-1 text-[#40536d]">
            <Link2 size={13} />
            Links
          </span>
          {QUICK_LINKS.map((link) => (
            <button
              key={link.url}
              type="button"
              onClick={() => {
                setAddress(link.url)
                setSubmittedUrl(link.url)
              }}
              className="shrink-0 rounded border border-[#9aa9ba] bg-[#edf3fa] px-2 py-1 hover:bg-white"
            >
              {link.label}
            </button>
          ))}
          <a
            href={archived}
            target="_blank"
            rel="noreferrer"
            className="ml-auto flex shrink-0 items-center gap-1 rounded border border-[#9aa9ba] bg-[#edf3fa] px-2 py-1 hover:bg-white"
          >
            Open archive
            <ExternalLink size={12} />
          </a>
        </div>
      </form>

      <div className="flex min-h-0 flex-1 flex-col bg-white">
        {useMock ? (
          <MockSite url={submittedUrl} year={year} />
        ) : (
          <>
            <div className="flex items-center gap-2 border-b border-[#d6dbe3] bg-[#f5f7fb] px-3 py-1.5 text-xs text-[#40536d]">
              <Sparkles size={14} className="text-[#1f5fba]" />
              Viewing the closest Wayback Machine capture for {year}. Some archived sites may block
              iframe display; use Open archive if the frame is blank.
            </div>
            <iframe
              key={`${archived}-${reloadKey}`}
              src={archived}
              title={`Wayback archive of ${submittedUrl}`}
              className="min-h-0 flex-1 border-0 bg-white"
              sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
            />
          </>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-[#6d7f95] bg-[#d9e2ef] px-3 py-1 text-[11px] text-[#40536d]">
        {useMock ? <ShieldAlert size={13} /> : <Globe2 size={13} />}
        {useMock
          ? 'Local generated page: Wayback has no real capture for this year.'
          : `Archive URL: ${archived}`}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import {
  ArchiveRestore,
  Bell,
  Check,
  Database,
  Download,
  FolderTree,
  HardDrive,
  Monitor,
  Moon,
  Paintbrush,
  RotateCcw,
  Save,
  Upload,
  Volume2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type PanelId = 'appearance' | 'sounds' | 'backup' | 'filesystem'

interface ControlSettings {
  appearance: {
    theme: 'graphite' | 'aqua' | 'classic'
    accent: string
    wallpaper: 'aurora' | 'grid' | 'midnight'
    reduceTransparency: boolean
  }
  sounds: {
    volume: number
    alertSound: 'chime' | 'glass' | 'submarine'
    muteSystem: boolean
    keyboardClicks: boolean
  }
  backup: {
    autoBackup: boolean
    frequency: 'hourly' | 'daily' | 'weekly'
    destination: string
    lastBackup: string
  }
  filesystem: {
    showHiddenFiles: boolean
    indexing: boolean
    cacheLimit: number
    defaultFolder: string
  }
}

const STORAGE_KEY = 'morris-control-panels-settings'

const DEFAULT_SETTINGS: ControlSettings = {
  appearance: {
    theme: 'graphite',
    accent: '#0a84ff',
    wallpaper: 'aurora',
    reduceTransparency: false,
  },
  sounds: {
    volume: 62,
    alertSound: 'chime',
    muteSystem: false,
    keyboardClicks: true,
  },
  backup: {
    autoBackup: true,
    frequency: 'daily',
    destination: 'iCloud Drive / Morris',
    lastBackup: 'Never',
  },
  filesystem: {
    showHiddenFiles: false,
    indexing: true,
    cacheLimit: 12,
    defaultFolder: 'Documents',
  },
}

const PANELS: { id: PanelId; label: string; description: string; icon: typeof Monitor }[] = [
  { id: 'appearance', label: 'Appearance', description: 'Theme, accent, wallpaper', icon: Paintbrush },
  { id: 'sounds', label: 'Sounds', description: 'Alerts and system audio', icon: Volume2 },
  { id: 'backup', label: 'Backup', description: 'Export and restore settings', icon: ArchiveRestore },
  { id: 'filesystem', label: 'File System', description: 'Finder and storage behavior', icon: FolderTree },
]

function loadSettings(): ControlSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } as ControlSettings
  } catch {
    return DEFAULT_SETTINGS
  }
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 rounded-full border transition-colors',
        checked ? 'border-[#0a84ff] bg-[#0a84ff]' : 'border-white/15 bg-white/10'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
          checked ? 'translate-x-[19px]' : 'translate-x-0.5'
        )}
      />
    </button>
  )
}

function FieldRow({
  label,
  detail,
  children,
}: {
  label: string
  detail?: string
  children: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/8 py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-white/88">{label}</p>
        {detail && <p className="mt-0.5 text-xs text-white/42">{detail}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string
  onChange: (value: string) => void
  children: ReactNode
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-8 rounded-md border border-white/10 bg-[#2b2b31] px-2 text-xs text-white outline-none"
    >
      {children}
    </select>
  )
}

export function ControlPanelsApp() {
  const [active, setActive] = useState<PanelId>('appearance')
  const [settings, setSettings] = useState<ControlSettings>(DEFAULT_SETTINGS)
  const [importText, setImportText] = useState('')
  const [message, setMessage] = useState('Settings are stored locally in this browser.')

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  const exported = useMemo(() => JSON.stringify(settings, null, 2), [settings])

  function update<K extends keyof ControlSettings>(
    section: K,
    patch: Partial<ControlSettings[K]>
  ) {
    setSettings((current) => ({
      ...current,
      [section]: { ...current[section], ...patch },
    }))
  }

  function importSettings() {
    try {
      const parsed = JSON.parse(importText) as ControlSettings
      setSettings({ ...DEFAULT_SETTINGS, ...parsed })
      setMessage('Settings imported successfully.')
    } catch {
      setMessage('Import failed. Paste a valid JSON export.')
    }
  }

  function exportToFile() {
    const blob = new Blob([exported], { type: 'application/json' })
    const href = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = href
    link.download = 'control-panels-settings.json'
    link.click()
    URL.revokeObjectURL(href)
    setMessage('Settings export downloaded.')
  }

  function importFromFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setImportText(String(reader.result ?? ''))
      setMessage('File loaded. Review JSON and press Import.')
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#1c1c1f] text-white">
      <aside className="w-52 shrink-0 border-r border-white/10 bg-[#26262b] p-3">
        <div className="mb-3 px-2">
          <h2 className="font-display text-base font-semibold">Control Panels</h2>
          <p className="mt-0.5 text-xs text-white/40">System preferences</p>
        </div>
        <nav className="space-y-1">
          {PANELS.map((panel) => {
            const Icon = panel.icon
            return (
              <button
                key={panel.id}
                onClick={() => setActive(panel.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors',
                  active === panel.id ? 'bg-[#0a84ff] text-white' : 'text-white/72 hover:bg-white/7'
                )}
              >
                <Icon size={17} className="shrink-0" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{panel.label}</span>
                  <span className="block truncate text-[11px] opacity-65">{panel.description}</span>
                </span>
              </button>
            )
          })}
        </nav>
      </aside>

      <main className="min-w-0 flex-1 overflow-auto bg-[#19191c]">
        <div className="mx-auto max-w-3xl p-5">
          {active === 'appearance' && (
            <section>
              <PanelHeader icon={Monitor} title="Appearance" detail="Tune the desktop surface." />
              <div className="rounded-md border border-white/10 bg-[#242429] px-4">
                <FieldRow label="Theme" detail="Controls the preferred window chrome tone.">
                  <Select
                    value={settings.appearance.theme}
                    onChange={(value) => update('appearance', { theme: value as ControlSettings['appearance']['theme'] })}
                  >
                    <option value="graphite">Graphite</option>
                    <option value="aqua">Aqua</option>
                    <option value="classic">Classic Platinum</option>
                  </Select>
                </FieldRow>
                <FieldRow label="Accent color" detail="Used by selected controls and highlights.">
                  <input
                    type="color"
                    value={settings.appearance.accent}
                    onChange={(event) => update('appearance', { accent: event.target.value })}
                    className="h-8 w-12 rounded border border-white/10 bg-transparent"
                  />
                </FieldRow>
                <FieldRow label="Wallpaper style">
                  <Select
                    value={settings.appearance.wallpaper}
                    onChange={(value) => update('appearance', { wallpaper: value as ControlSettings['appearance']['wallpaper'] })}
                  >
                    <option value="aurora">Aurora</option>
                    <option value="grid">Grid</option>
                    <option value="midnight">Midnight</option>
                  </Select>
                </FieldRow>
                <FieldRow label="Reduce transparency" detail="Prefer solid surfaces over glass effects.">
                  <Toggle
                    checked={settings.appearance.reduceTransparency}
                    onChange={(checked) => update('appearance', { reduceTransparency: checked })}
                  />
                </FieldRow>
              </div>
              <Preview settings={settings} />
            </section>
          )}

          {active === 'sounds' && (
            <section>
              <PanelHeader icon={Volume2} title="Sounds" detail="Configure feedback and alert behavior." />
              <div className="rounded-md border border-white/10 bg-[#242429] px-4">
                <FieldRow label="Output volume" detail={`${settings.sounds.volume}%`}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={settings.sounds.volume}
                    onChange={(event) => update('sounds', { volume: Number(event.target.value) })}
                    className="w-36 accent-[#0a84ff]"
                  />
                </FieldRow>
                <FieldRow label="Alert sound">
                  <Select
                    value={settings.sounds.alertSound}
                    onChange={(value) => update('sounds', { alertSound: value as ControlSettings['sounds']['alertSound'] })}
                  >
                    <option value="chime">Chime</option>
                    <option value="glass">Glass</option>
                    <option value="submarine">Submarine</option>
                  </Select>
                </FieldRow>
                <FieldRow label="Mute system sounds">
                  <Toggle
                    checked={settings.sounds.muteSystem}
                    onChange={(checked) => update('sounds', { muteSystem: checked })}
                  />
                </FieldRow>
                <FieldRow label="Keyboard clicks">
                  <Toggle
                    checked={settings.sounds.keyboardClicks}
                    onChange={(checked) => update('sounds', { keyboardClicks: checked })}
                  />
                </FieldRow>
              </div>
              <div className="mt-4 rounded-md border border-white/10 bg-[#242429] p-4">
                <button
                  onClick={() => setMessage(`Previewed ${settings.sounds.alertSound} at ${settings.sounds.volume}%.`)}
                  className="flex h-9 items-center gap-2 rounded-md bg-white/10 px-3 text-sm hover:bg-white/15"
                >
                  <Bell size={15} />
                  Play Alert Preview
                </button>
              </div>
            </section>
          )}

          {active === 'backup' && (
            <section>
              <PanelHeader icon={ArchiveRestore} title="Backup And Restore" detail="Export or import local preferences." />
              <div className="rounded-md border border-white/10 bg-[#242429] px-4">
                <FieldRow label="Automatic backup">
                  <Toggle
                    checked={settings.backup.autoBackup}
                    onChange={(checked) => update('backup', { autoBackup: checked })}
                  />
                </FieldRow>
                <FieldRow label="Frequency">
                  <Select
                    value={settings.backup.frequency}
                    onChange={(value) => update('backup', { frequency: value as ControlSettings['backup']['frequency'] })}
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </Select>
                </FieldRow>
                <FieldRow label="Destination">
                  <input
                    value={settings.backup.destination}
                    onChange={(event) => update('backup', { destination: event.target.value })}
                    className="h-8 w-56 rounded-md border border-white/10 bg-[#2b2b31] px-2 text-xs outline-none"
                  />
                </FieldRow>
                <FieldRow label="Last backup" detail={settings.backup.lastBackup}>
                  <button
                    onClick={() =>
                      update('backup', {
                        lastBackup: new Date().toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }),
                      })
                    }
                    className="flex h-8 items-center gap-1.5 rounded-md bg-[#0a84ff] px-3 text-xs font-semibold text-white"
                  >
                    <Save size={14} />
                    Back Up Now
                  </button>
                </FieldRow>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-md border border-white/10 bg-[#242429] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold">Export</p>
                    <button
                      onClick={exportToFile}
                      className="flex h-8 items-center gap-1.5 rounded-md bg-white/10 px-3 text-xs hover:bg-white/15"
                    >
                      <Download size={14} />
                      Download
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={exported}
                    className="h-44 w-full resize-none rounded border border-white/10 bg-black/25 p-3 font-mono text-[11px] text-white/60 outline-none"
                  />
                </div>
                <div className="rounded-md border border-white/10 bg-[#242429] p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">Import</p>
                    <label className="flex h-8 cursor-pointer items-center gap-1.5 rounded-md bg-white/10 px-3 text-xs hover:bg-white/15">
                      <Upload size={14} />
                      File
                      <input type="file" accept="application/json,.json" onChange={importFromFile} className="hidden" />
                    </label>
                  </div>
                  <textarea
                    value={importText}
                    onChange={(event) => setImportText(event.target.value)}
                    placeholder="Paste exported JSON here"
                    className="h-44 w-full resize-none rounded border border-white/10 bg-black/25 p-3 font-mono text-[11px] text-white/80 outline-none placeholder:text-white/25"
                  />
                  <button
                    onClick={importSettings}
                    className="mt-3 flex h-8 items-center gap-1.5 rounded-md bg-[#0a84ff] px-3 text-xs font-semibold"
                  >
                    <ArchiveRestore size={14} />
                    Import
                  </button>
                </div>
              </div>
            </section>
          )}

          {active === 'filesystem' && (
            <section>
              <PanelHeader icon={HardDrive} title="File System Management" detail="Simulated storage and Finder options." />
              <div className="rounded-md border border-white/10 bg-[#242429] px-4">
                <FieldRow label="Show hidden files" detail="Reveal dotfiles and system folders.">
                  <Toggle
                    checked={settings.filesystem.showHiddenFiles}
                    onChange={(checked) => update('filesystem', { showHiddenFiles: checked })}
                  />
                </FieldRow>
                <FieldRow label="Spotlight indexing">
                  <Toggle
                    checked={settings.filesystem.indexing}
                    onChange={(checked) => update('filesystem', { indexing: checked })}
                  />
                </FieldRow>
                <FieldRow label="Cache limit" detail={`${settings.filesystem.cacheLimit} GB reserved`}>
                  <input
                    type="range"
                    min={2}
                    max={64}
                    value={settings.filesystem.cacheLimit}
                    onChange={(event) => update('filesystem', { cacheLimit: Number(event.target.value) })}
                    className="w-36 accent-[#0a84ff]"
                  />
                </FieldRow>
                <FieldRow label="Default folder">
                  <Select
                    value={settings.filesystem.defaultFolder}
                    onChange={(value) => update('filesystem', { defaultFolder: value })}
                  >
                    <option value="Documents">Documents</option>
                    <option value="Desktop">Desktop</option>
                    <option value="Downloads">Downloads</option>
                    <option value="Projects">Projects</option>
                  </Select>
                </FieldRow>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  { label: 'Indexed files', value: settings.filesystem.indexing ? '42,108' : 'Paused', icon: Database },
                  { label: 'Hidden files', value: settings.filesystem.showHiddenFiles ? 'Visible' : 'Hidden', icon: FolderTree },
                  { label: 'Cache cap', value: `${settings.filesystem.cacheLimit} GB`, icon: HardDrive },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="rounded-md border border-white/10 bg-[#242429] p-4">
                      <Icon size={18} className="mb-3 text-[#0a84ff]" />
                      <p className="text-xs text-white/42">{item.label}</p>
                      <p className="mt-1 text-lg font-semibold">{item.value}</p>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </main>

      <div className="absolute bottom-0 left-52 right-0 flex items-center justify-between gap-2 border-t border-white/10 bg-[#202025]/95 px-4 py-2 text-xs text-white/50 backdrop-blur">
        <span className="flex items-center gap-2">
          <Check size={14} className="text-emerald-400" />
          {message}
        </span>
        <button
          onClick={() => {
            setSettings(DEFAULT_SETTINGS)
            setMessage('Settings reset to defaults.')
          }}
          className="flex h-7 items-center gap-1.5 rounded-md px-2 text-white/65 hover:bg-white/10"
        >
          <RotateCcw size={13} />
          Defaults
        </button>
      </div>
    </div>
  )
}

function PanelHeader({
  icon: Icon,
  title,
  detail,
}: {
  icon: typeof Monitor
  title: string
  detail: string
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-md border border-white/10 bg-white/8">
        <Icon size={20} />
      </div>
      <div>
        <h3 className="font-display text-xl font-semibold">{title}</h3>
        <p className="text-sm text-white/45">{detail}</p>
      </div>
    </div>
  )
}

function Preview({ settings }: { settings: ControlSettings }) {
  return (
    <div className="mt-4 rounded-md border border-white/10 bg-[#242429] p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        {settings.appearance.theme === 'classic' ? <Monitor size={16} /> : <Moon size={16} />}
        Live Preference Preview
      </div>
      <div
        className="overflow-hidden rounded-md border border-white/10"
        style={{ backgroundColor: settings.appearance.accent }}
      >
        <div
          className={cn(
            'h-24 p-3',
            settings.appearance.wallpaper === 'aurora' &&
              'bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.55),transparent_28%),radial-gradient(circle_at_80%_80%,rgba(0,0,0,0.28),transparent_36%)]',
            settings.appearance.wallpaper === 'grid' &&
              'bg-[linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px)] bg-[size:18px_18px]',
            settings.appearance.wallpaper === 'midnight' && 'bg-black/45'
          )}
        >
          <div
            className={cn(
              'h-full rounded-md border border-white/25 p-3 shadow-xl',
              settings.appearance.reduceTransparency ? 'bg-[#202025]' : 'bg-white/18 backdrop-blur-md'
            )}
          >
            <p className="text-sm font-semibold">Sample Window</p>
            <p className="mt-1 text-xs text-white/75">Theme: {settings.appearance.theme}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

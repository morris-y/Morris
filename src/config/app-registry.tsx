'use client'

import React from 'react'
import {
  AudioWaveform,
  Bot,
  Camera,
  Clapperboard,
  Cpu,
  FileText,
  Folder,
  Gamepad2,
  Globe2,
  HardDrive,
  NotebookPen,
  Film,
  MonitorPlay,
  Music,
  Paintbrush,
  Settings,
  SquareTerminal,
  Store,
  StickyNote,
  Fingerprint,
  AtSign,
  Smartphone,
} from 'lucide-react'
import type { AppDefinition, AppWindowProps } from '@/types/window'
import type { AppId } from '@/types/window'

const FinderApp = React.lazy(() =>
  import('@/components/apps/finder-app').then((m) => ({ default: m.FinderApp }))
)

const TextEditApp = React.lazy(() =>
  import('@/components/apps/textedit-app').then((m) => ({ default: m.TextEditApp }))
)

const MacPaintApp = React.lazy(() =>
  import('@/components/apps/macpaint-app').then((m) => ({ default: m.MacPaintApp }))
)

const VideosApp = React.lazy(() =>
  import('@/components/apps/videos-app').then((m) => ({ default: m.VideosApp }))
)

const SoundboardApp = React.lazy(() =>
  import('@/components/apps/soundboard-app').then((m) => ({ default: m.SoundboardApp }))
)

const SynthApp = React.lazy(() =>
  import('@/components/apps/synth-app').then((m) => ({ default: m.SynthApp }))
)

const PhotoBoothApp = React.lazy(() =>
  import('@/components/apps/photo-booth-app').then((m) => ({ default: m.PhotoBoothApp }))
)

const InternetExplorerApp = React.lazy(() =>
  import('@/components/apps/internet-explorer-app').then((m) => ({ default: m.InternetExplorerApp }))
)

const ChatsApp = React.lazy(() =>
  import('@/components/apps/chats-app').then((m) => ({ default: m.ChatsApp }))
)

const ControlPanelsApp = React.lazy(() =>
  import('@/components/apps/control-panels-app').then((m) => ({ default: m.ControlPanelsApp }))
)

const MinesweeperApp = React.lazy(() =>
  import('@/components/apps/minesweeper-app').then((m) => ({ default: m.MinesweeperApp }))
)

const VirtualPcApp = React.lazy(() =>
  import('@/components/apps/virtual-pc-app').then((m) => ({ default: m.VirtualPcApp }))
)

const InfiniteMacApp = React.lazy(() =>
  import('@/components/apps/infinite-mac-app').then((m) => ({ default: m.InfiniteMacApp }))
)

const IpodApp = React.lazy(() =>
  import('@/components/apps/ipod-app').then((m) => ({ default: m.IpodApp }))
)

const AppletStoreApp = React.lazy(() =>
  import('@/components/apps/applet-store-app').then((m) => ({ default: m.AppletStoreApp }))
)

const StickiesApp = React.lazy(() =>
  import('@/components/apps/stickies-app').then((m) => ({ default: m.StickiesApp }))
)

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
    id: 'finder',
    name: 'Finder',
    icon: '🗂️',
    gradientCss: 'radial-gradient(ellipse at 38% 28%, #8ED6FF 0%, #2C83EA 48%, #0B3C9E 100%)',
    Glyph: Folder,
    description: 'Files, storage, and smart detection',
    windowConstraints: {
      defaultSize: { width: 980, height: 640 },
      minSize: { width: 620, height: 420 },
    },
    component: FinderApp as React.ComponentType<AppWindowProps>,
  },
  {
    id: 'textedit',
    name: 'TextEdit',
    icon: '📄',
    gradientCss: 'radial-gradient(ellipse at 38% 28%, #FFFFFF 0%, #C9D5DF 54%, #6D7784 100%)',
    Glyph: FileText,
    description: 'Markdown editor and slash commands',
    windowConstraints: {
      defaultSize: { width: 900, height: 620 },
      minSize: { width: 560, height: 420 },
    },
    component: TextEditApp as React.ComponentType<AppWindowProps>,
  },
  {
    id: 'macpaint',
    name: 'MacPaint',
    icon: '🎨',
    gradientCss: 'radial-gradient(ellipse at 36% 26%, #F8F0D8 0%, #CEB887 50%, #534638 100%)',
    Glyph: Paintbrush,
    description: 'Bitmap painting studio',
    windowConstraints: {
      defaultSize: { width: 980, height: 680 },
      minSize: { width: 680, height: 460 },
    },
    component: MacPaintApp as React.ComponentType<AppWindowProps>,
  },
  {
    id: 'videos',
    name: 'Videos',
    icon: '📼',
    gradientCss: 'radial-gradient(ellipse at 38% 28%, #A8A8A8 0%, #3C4048 48%, #090A0D 100%)',
    Glyph: Clapperboard,
    description: 'VCR-style YouTube playlists',
    windowConstraints: {
      defaultSize: { width: 980, height: 640 },
      minSize: { width: 640, height: 440 },
    },
    component: VideosApp as React.ComponentType<AppWindowProps>,
  },
  {
    id: 'soundboard',
    name: 'Soundboard',
    icon: '🔊',
    gradientCss: 'radial-gradient(ellipse at 38% 28%, #FFE27A 0%, #F26822 48%, #72120A 100%)',
    Glyph: AudioWaveform,
    description: 'Record, pad, and visualize sounds',
    windowConstraints: {
      defaultSize: { width: 900, height: 620 },
      minSize: { width: 620, height: 420 },
    },
    component: SoundboardApp as React.ComponentType<AppWindowProps>,
  },
  {
    id: 'synth',
    name: 'Synth',
    icon: '🎹',
    gradientCss: 'radial-gradient(ellipse at 38% 28%, #7CFBE8 0%, #147E76 48%, #062E37 100%)',
    Glyph: AudioWaveform,
    description: 'Virtual synth and MIDI lab',
    windowConstraints: {
      defaultSize: { width: 980, height: 620 },
      minSize: { width: 680, height: 440 },
    },
    component: SynthApp as React.ComponentType<AppWindowProps>,
  },
  {
    id: 'photo-booth',
    name: 'Photo Booth',
    icon: '📸',
    gradientCss: 'radial-gradient(ellipse at 38% 28%, #FF8BAA 0%, #C81D57 48%, #4B0A1E 100%)',
    Glyph: Camera,
    description: 'Camera filters and gallery',
    windowConstraints: {
      defaultSize: { width: 900, height: 640 },
      minSize: { width: 620, height: 440 },
    },
    component: PhotoBoothApp as React.ComponentType<AppWindowProps>,
  },
  {
    id: 'internet-explorer',
    name: 'Internet Explorer',
    icon: '🌐',
    gradientCss: 'radial-gradient(ellipse at 38% 28%, #8CEBFF 0%, #0878D4 48%, #073061 100%)',
    Glyph: Globe2,
    description: 'Wayback and generated web eras',
    windowConstraints: {
      defaultSize: { width: 1040, height: 680 },
      minSize: { width: 680, height: 460 },
    },
    component: InternetExplorerApp as React.ComponentType<AppWindowProps>,
  },
  {
    id: 'chats',
    name: 'Chats',
    icon: '💬',
    gradientCss: 'radial-gradient(ellipse at 38% 28%, #D7FF2F 0%, #3C8C2E 48%, #102712 100%)',
    Glyph: Bot,
    description: 'Ryo, rooms, voice, and tools',
    windowConstraints: {
      defaultSize: { width: 920, height: 640 },
      minSize: { width: 620, height: 440 },
    },
    component: ChatsApp as React.ComponentType<AppWindowProps>,
  },
  {
    id: 'control-panels',
    name: 'Control Panels',
    icon: '⚙️',
    gradientCss: 'radial-gradient(ellipse at 38% 28%, #DCE6F2 0%, #6A7D92 48%, #202832 100%)',
    Glyph: Settings,
    description: 'Appearance, sound, backup, files',
    windowConstraints: {
      defaultSize: { width: 920, height: 620 },
      minSize: { width: 620, height: 420 },
    },
    component: ControlPanelsApp as React.ComponentType<AppWindowProps>,
  },
  {
    id: 'minesweeper',
    name: 'Minesweeper',
    icon: '💣',
    gradientCss: 'radial-gradient(ellipse at 38% 28%, #F7F7F7 0%, #8B929A 48%, #25282E 100%)',
    Glyph: Gamepad2,
    description: 'Classic puzzle game',
    windowConstraints: {
      defaultSize: { width: 620, height: 620 },
      minSize: { width: 460, height: 520 },
    },
    component: MinesweeperApp as React.ComponentType<AppWindowProps>,
  },
  {
    id: 'virtual-pc',
    name: 'Virtual PC',
    icon: '💾',
    gradientCss: 'radial-gradient(ellipse at 38% 28%, #B4C1D9 0%, #3B4A62 48%, #11151D 100%)',
    Glyph: HardDrive,
    description: 'DOS games and save states',
    windowConstraints: {
      defaultSize: { width: 960, height: 620 },
      minSize: { width: 680, height: 440 },
    },
    component: VirtualPcApp as React.ComponentType<AppWindowProps>,
  },
  {
    id: 'infinite-mac',
    name: 'Infinite Mac',
    icon: '🖥️',
    gradientCss: 'radial-gradient(ellipse at 38% 28%, #F2E8C9 0%, #8B806A 48%, #25211B 100%)',
    Glyph: Cpu,
    description: 'Classic Mac OS emulators',
    windowConstraints: {
      defaultSize: { width: 1080, height: 720 },
      minSize: { width: 740, height: 500 },
    },
    component: InfiniteMacApp as React.ComponentType<AppWindowProps>,
  },
  {
    id: 'ipod',
    name: 'iPod',
    icon: '🎧',
    gradientCss: 'radial-gradient(ellipse at 38% 28%, #F5F0E4 0%, #B9B09E 48%, #4A4238 100%)',
    Glyph: Music,
    description: '1st-gen player and YouTube import',
    windowConstraints: {
      defaultSize: { width: 980, height: 680 },
      minSize: { width: 720, height: 500 },
    },
    component: IpodApp as React.ComponentType<AppWindowProps>,
  },
  {
    id: 'applet-store',
    name: 'Applet Store',
    icon: '🧩',
    gradientCss: 'radial-gradient(ellipse at 38% 28%, #FFD66E 0%, #C47B16 48%, #4C2606 100%)',
    Glyph: Store,
    description: 'Install and share HTML applets',
    windowConstraints: {
      defaultSize: { width: 980, height: 640 },
      minSize: { width: 680, height: 460 },
    },
    component: AppletStoreApp as React.ComponentType<AppWindowProps>,
  },
  {
    id: 'stickies',
    name: 'Stickies',
    icon: '🟨',
    gradientCss: 'radial-gradient(ellipse at 38% 28%, #FFF36D 0%, #D6A51E 48%, #6B4B06 100%)',
    Glyph: StickyNote,
    description: 'Quick reminders and pinned notes',
    windowConstraints: {
      defaultSize: { width: 760, height: 560 },
      minSize: { width: 520, height: 380 },
    },
    component: StickiesApp as React.ComponentType<AppWindowProps>,
  },
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
    iconConfig: {
      // Deep cinema black with a subtle warm-red ambient bleed at top-left
      background: 'radial-gradient(ellipse at 36% 26%, #2E0A08 0%, #140404 52%, #080202 100%)',
      // Horizontal CRT scanlines — classic television/projection aesthetic
      texture:
        'repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 1px, transparent 1px, transparent 3px)',
      // Bold italic "N" — unmistakably Netflix, differentiated from About's "M"
      symbol: (s) => (
        <span
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Georgia, serif',
            fontSize: `${Math.round(s * 0.54)}px`,
            fontWeight: 900,
            fontStyle: 'italic',
            color: '#E50914',
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}
        >
          N
        </span>
      ),
      glowColor: 'rgba(229, 9, 20, 0.70)',
    },
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

'use client'

import { useEffect, useRef, type CSSProperties } from 'react'

export function Wallpaper() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    let frame = 0
    const handlePointer = (event: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        root.style.setProperty('--cursor-x', `${event.clientX}px`)
        root.style.setProperty('--cursor-y', `${event.clientY}px`)
      })
    }

    window.addEventListener('pointermove', handlePointer)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', handlePointer)
    }
  }, [])

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{
        '--cursor-x': '50vw',
        '--cursor-y': '42vh',
      } as CSSProperties}
    >
      <div className="wallpaper-tahoe absolute inset-0" />
      <div className="wallpaper-chromatic absolute inset-0" />
      <div className="wallpaper-cursor-field absolute inset-0" />
      <div className="wallpaper-grid absolute inset-0" />
      <div className="wallpaper-scanline absolute left-0 right-0 top-0" />

      <div
        className="bloom-1 absolute"
        style={{
          top: '-24%',
          left: '-10%',
          width: '68%',
          height: '68%',
          background:
            'radial-gradient(circle at 50% 50%, rgba(214, 255, 0, 0.28) 0%, rgba(166, 255, 0, 0.12) 38%, transparent 68%)',
          filter: 'blur(66px)',
          willChange: 'transform',
        }}
      />

      <div
        className="bloom-2 absolute"
        style={{
          bottom: '-28%',
          right: '-18%',
          width: '76%',
          height: '76%',
          background:
            'radial-gradient(circle at 50% 50%, rgba(255, 64, 0, 0.36) 0%, rgba(255, 0, 128, 0.14) 42%, transparent 72%)',
          filter: 'blur(78px)',
          willChange: 'transform',
        }}
      />

      <div
        className="bloom-1 absolute"
        style={{
          top: '18%',
          right: '-12%',
          width: '54%',
          height: '54%',
          background:
            'radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.30) 0%, rgba(0, 142, 255, 0.12) 44%, transparent 72%)',
          filter: 'blur(70px)',
          animationDuration: '46s',
          animationDelay: '-9s',
          willChange: 'transform',
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 110% at 50% 42%, transparent 56%, rgba(0, 0, 0, 0.72) 100%)',
        }}
      />

      <svg
        className="absolute inset-0 h-full w-full"
        style={{ opacity: 0.17, mixBlendMode: 'soft-light' }}
        aria-hidden="true"
      >
        <filter id="wallpaper-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.92"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#wallpaper-grain)" />
      </svg>
    </div>
  )
}

'use client'

import { useRef, useEffect } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

gsap.registerPlugin(useGSAP)

export function BootScreen({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useGSAP(
    () => {
      const tl = gsap.timeline()

      // Start: logo fades in
      tl.fromTo(
        logoRef.current,
        { opacity: 0, scale: 0.92 },
        { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }
      )

      // Caption fades in quietly beneath
      tl.fromTo(
        textRef.current,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        '-=0.25'
      )

      // Progress bar fills calmly
      tl.fromTo(
        progressBarRef.current,
        { width: '0%' },
        { width: '100%', duration: 1.5, ease: 'power2.inOut' },
        '-=0.1'
      )

      // Settle, then fade the black out for an Apple-like handoff to the desktop
      tl.to(containerRef.current, { duration: 0.2 })
      tl.to(containerRef.current, { opacity: 0, duration: 0.45, ease: 'power2.inOut' })

      tl.then(() => {
        onCompleteRef.current()
      })
    },
    { scope: containerRef }
  )

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-boot bg-black flex flex-col items-center justify-center gap-9"
    >
      {/* Logo monogram — graphite squircle matching the dock icon language */}
      <div
        ref={logoRef}
        style={{
          opacity: 0,
          borderRadius: '22.37%',
          background: 'linear-gradient(160deg, #3a3a3c, #1c1c1e)',
          boxShadow:
            'inset 0 1px 0.5px rgba(255,255,255,0.22), inset 0 0 0 0.5px rgba(255,255,255,0.06), 0 12px 32px rgba(0,0,0,0.55)',
        }}
        className="w-20 h-20 flex items-center justify-center"
      >
        <span className="text-white font-bold text-4xl tracking-tighter select-none">M</span>
      </div>

      {/* Progress section */}
      <div className="flex flex-col items-center gap-3.5 w-[180px]">
        {/* Progress bar track */}
        <div className="w-full h-[4px] bg-white/15 rounded-full overflow-hidden">
          <div
            ref={progressBarRef}
            style={{ width: '0%' }}
            className="h-full bg-white/85 rounded-full"
          />
        </div>

        {/* Quiet caption */}
        <p
          ref={textRef}
          style={{ opacity: 0 }}
          className="text-white/40 text-xs font-normal tracking-normal select-none"
        >
          Morris Yang
        </p>
      </div>
    </div>
  )
}

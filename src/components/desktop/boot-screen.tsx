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
  const completedRef = useRef(false)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    const fallback = setTimeout(() => {
      if (completedRef.current) return
      completedRef.current = true
      onCompleteRef.current()
    }, 3200)
    return () => clearTimeout(fallback)
  }, [])

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
        if (completedRef.current) return
        completedRef.current = true
        onCompleteRef.current()
      })
    },
    { scope: containerRef }
  )

  return (
    <div
      ref={containerRef}
      className="boot-screen fixed inset-0 z-boot flex flex-col items-center justify-center gap-9 bg-black"
    >
      <div className="boot-grid absolute inset-0" aria-hidden />
      <div className="boot-scan absolute inset-x-0 top-0" aria-hidden />

      <div
        ref={logoRef}
        style={{
          opacity: 0,
          borderRadius: '18%',
          background:
            'radial-gradient(circle at 34% 24%, rgba(215,255,47,0.88), rgba(255,61,0,0.56) 42%, rgba(0,0,0,0.92) 100%)',
          boxShadow:
            'inset 0 1px 0.5px rgba(255,255,255,0.32), inset 0 0 0 1px rgba(255,255,255,0.16), 0 0 70px rgba(215,255,47,0.22), 0 18px 52px rgba(0,0,0,0.72)',
        }}
        className="relative flex h-20 w-20 items-center justify-center overflow-hidden border border-white/20"
      >
        <span className="absolute inset-x-0 top-0 h-px bg-[#d7ff2f]/80" />
        <span className="select-none font-display text-4xl font-semibold leading-none text-white">M</span>
      </div>

      <div className="z-10 flex w-[220px] flex-col items-center gap-3.5">
        <div className="flex w-full items-center justify-between font-mono text-[10px] uppercase text-white/42">
          <span>boot</span>
          <span>morris.os</span>
        </div>
        <div className="h-[5px] w-full overflow-hidden border border-white/15 bg-white/[0.08]">
          <div
            ref={progressBarRef}
            style={{ width: '0%' }}
            className="h-full bg-[#d7ff2f]"
          />
        </div>

        <p
          ref={textRef}
          style={{ opacity: 0 }}
          className="select-none font-mono text-[11px] uppercase text-white/48"
        >
          Product systems / AI / markets
        </p>
      </div>
    </div>
  )
}

'use client'

export function Wallpaper() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Base layer — vivid Tahoe fluid gradient (violet/magenta/blue/teal over deep indigo→near-black) */}
      <div className="wallpaper-tahoe absolute inset-0" />

      {/* Drifting bloom layers — large, soft, saturated glows the glass above will refract.
          Animate transform/opacity only (via .bloom-1 / .bloom-2). */}

      {/* Bloom A — violet, upper-left bloom that breathes outward */}
      <div
        className="bloom-1 absolute"
        style={{
          top: '-18%',
          left: '-12%',
          width: '70%',
          height: '70%',
          background:
            'radial-gradient(circle at 50% 50%, rgba(138, 92, 255, 0.50) 0%, rgba(124, 77, 255, 0.22) 42%, transparent 70%)',
          filter: 'blur(80px)',
          willChange: 'transform',
        }}
      />

      {/* Bloom B — magenta/pink, lower-right counterweight */}
      <div
        className="bloom-2 absolute"
        style={{
          bottom: '-22%',
          right: '-14%',
          width: '72%',
          height: '72%',
          background:
            'radial-gradient(circle at 50% 50%, rgba(255, 74, 188, 0.46) 0%, rgba(214, 56, 168, 0.20) 44%, transparent 70%)',
          filter: 'blur(88px)',
          willChange: 'transform',
        }}
      />

      {/* Bloom C — electric blue + teal, mid-right; slowest drift for parallax depth */}
      <div
        className="bloom-1 absolute"
        style={{
          top: '26%',
          right: '-8%',
          width: '52%',
          height: '52%',
          background:
            'radial-gradient(circle at 50% 50%, rgba(64, 150, 255, 0.42) 0%, rgba(40, 210, 200, 0.18) 46%, transparent 72%)',
          filter: 'blur(72px)',
          animationDuration: '52s',
          animationDelay: '-8s',
          willChange: 'transform',
        }}
      />

      {/* Very faint EDGE vignette — keeps the center glow rich, only softens the frame */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(130% 120% at 50% 45%, transparent 62%, rgba(6, 5, 14, 0.34) 100%)',
        }}
      />

      {/* Static fine grain — never animates (no shimmer). Adds material texture under the glass. */}
      <svg
        className="absolute inset-0 h-full w-full"
        style={{ opacity: 0.02, mixBlendMode: 'overlay' }}
        aria-hidden="true"
      >
        <filter id="wallpaper-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#wallpaper-grain)" />
      </svg>
    </div>
  )
}

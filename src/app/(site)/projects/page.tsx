import { NetflixHeader } from '@/components/netflix/netflix-header'
import { NetflixRow } from '@/components/netflix/netflix-row'
import { NetflixProjectCard, NetflixExperienceCard } from '@/components/netflix/netflix-card'
import { projects, experience, siteConfig } from '@/lib/content'

export const metadata = {
  title: 'Projects — Morris Yang',
}

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-[#141414]">
      <NetflixHeader />

      {/* Hero banner */}
      <div className="relative h-[45vh] flex items-end bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#141414] px-6 md:px-12 pb-10">
        <div>
          <p className="text-white/40 text-xs uppercase tracking-widest mb-2">product builder</p>
          <h1 className="text-white text-4xl md:text-5xl font-bold leading-tight mb-3">
            {siteConfig.name}
          </h1>
          <p className="text-white/60 text-sm md:text-base max-w-xl leading-relaxed">
            {siteConfig.tagline}
          </p>
        </div>
      </div>

      {/* Content rows */}
      <div className="pt-6">
        <NetflixRow title="Projects">
          {projects.map((p) => (
            <NetflixProjectCard key={p.title} project={p} />
          ))}
        </NetflixRow>

        <NetflixRow title="Experience">
          {experience.map((e) => (
            <NetflixExperienceCard key={`${e.company}-${e.role}`} item={e} />
          ))}
        </NetflixRow>
      </div>
    </div>
  )
}

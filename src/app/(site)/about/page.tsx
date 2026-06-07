import type { Metadata } from 'next'
import { BioSection } from '@/components/about/bio-section'
import { SkillsSection } from '@/components/about/skills-section'

export const metadata: Metadata = {
  title: 'About — Morris Yang',
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight mb-10">About</h1>

      <div className="space-y-12">
        <section>
          <h2 className="text-lg font-semibold mb-4">Background</h2>
          <BioSection />
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Skills & Domains</h2>
          <SkillsSection />
        </section>
      </div>
    </div>
  )
}

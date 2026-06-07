import type { Metadata } from 'next'
import { Timeline } from '@/components/experience/timeline'

export const metadata: Metadata = {
  title: 'Experience — Morris Yang',
}

export default function ExperiencePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight mb-10">Experience</h1>

      <section className="mb-16">
        <h2 className="text-lg font-semibold mb-8">Work</h2>
        <Timeline />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Education</h2>
        <div className="space-y-2">
          <p className="font-medium text-foreground">
            National Chengchi University
          </p>
          <p className="text-sm text-muted-foreground">
            MA Communications · Feb 2024
          </p>
          <p className="text-sm text-muted-foreground">
            Scholarships: Meta × NCCU, Academia Sinica, College of Communication NCCU, Jan Social Welfare Foundation
          </p>
        </div>
      </section>
    </div>
  )
}

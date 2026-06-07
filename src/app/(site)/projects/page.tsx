import type { Metadata } from 'next'
import { ProjectsGrid } from '@/components/projects/projects-grid'

export const metadata: Metadata = {
  title: 'Projects — Morris Yang',
}

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight mb-10">Projects</h1>
      <ProjectsGrid />
    </div>
  )
}

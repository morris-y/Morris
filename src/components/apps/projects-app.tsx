'use client'

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { projects } from '@/lib/content'
import type { AppWindowProps } from '@/types/window'

type FilterTag = 'all' | string

export function ProjectsApp(_props: AppWindowProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTag>('all')

  // Collect unique tags from all projects
  const allTags = Array.from(
    new Set(projects.flatMap((p) => p.techStack))
  ).slice(0, 8)

  const filtered =
    activeFilter === 'all'
      ? projects
      : projects.filter((p) => p.techStack.includes(activeFilter))

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#1c1c1e]">
      {/* Left sidebar — filters */}
      <aside className="w-44 shrink-0 bg-[#252528] border-r border-white/[0.08] flex flex-col py-3 gap-0.5 overflow-y-auto">
        <p className="text-white/30 text-[10px] uppercase tracking-widest font-semibold px-4 pt-1 pb-2">
          Filter
        </p>
        {(['all', ...allTags] as FilterTag[]).map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveFilter(tag)}
            className={cn(
              'flex items-center gap-2 px-4 py-1.5 text-xs text-left w-full rounded-md mx-1 transition-colors duration-100 capitalize',
              activeFilter === tag
                ? 'bg-purple-500/20 text-purple-300'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            )}
            style={{ width: 'calc(100% - 8px)' }}
          >
            {tag === 'all' ? '✦ All Projects' : tag}
          </button>
        ))}
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto min-w-0 p-5">
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="flex h-40 items-center justify-center">
              <p className="text-white/30 text-sm">No projects match this filter.</p>
            </div>
          ) : (
            filtered.map((project) => (
              <div
                key={project.title}
                className="rounded-xl bg-white/[0.04] border border-white/[0.07] p-4 hover:bg-white/[0.06] transition-colors"
              >
                {/* Title row */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="text-white/90 text-sm font-semibold leading-snug">
                    {project.title}
                  </h3>
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View ${project.title}`}
                      className="shrink-0 text-white/30 hover:text-white/70 transition-colors mt-0.5"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>

                {/* Description */}
                <p className="text-white/55 text-xs leading-relaxed mb-3">
                  {project.description}
                </p>

                {/* Tech stack */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded-md text-[10px] bg-purple-500/10 text-purple-300/80 border border-purple-500/15 font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Outcomes */}
                <p className="text-white/40 text-[11px] leading-relaxed border-t border-white/[0.06] pt-2">
                  {project.outcomes}
                </p>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}

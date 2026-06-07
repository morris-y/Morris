'use client'

import { ExternalLink } from 'lucide-react'
import type { Project, ExperienceItem } from '@/lib/content'

export function NetflixProjectCard({ project }: { project: Project }) {
  return (
    <div className="group relative shrink-0 w-52 md:w-64 rounded-md overflow-hidden bg-[#1f1f1f] cursor-pointer transition-transform duration-200 hover:scale-105 hover:z-10">
      {/* Thumbnail placeholder */}
      <div className="h-36 bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center">
        <span className="text-white/20 text-4xl font-bold select-none">
          {project.title.charAt(0)}
        </span>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-[#141414] opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-4 flex flex-col gap-2 overflow-hidden">
        <div className="flex items-start justify-between gap-1">
          <h3 className="text-white text-sm font-semibold leading-tight">{project.title}</h3>
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-white/50 hover:text-[#e50914] transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
        <p className="text-white/60 text-xs leading-relaxed line-clamp-3">{project.description}</p>
        <div className="flex flex-wrap gap-1 mt-auto">
          {project.techStack.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/50"
            >
              {tech}
            </span>
          ))}
        </div>
        <p className="text-[#e50914] text-[10px] font-medium">{project.outcomes}</p>
      </div>

      {/* Always-visible title strip */}
      <div className="p-3 group-hover:opacity-0 transition-opacity duration-200">
        <h3 className="text-white text-xs font-medium leading-tight line-clamp-2">{project.title}</h3>
      </div>
    </div>
  )
}

export function NetflixExperienceCard({ item }: { item: ExperienceItem }) {
  return (
    <div className="group relative shrink-0 w-52 md:w-64 rounded-md overflow-hidden bg-[#1f1f1f] cursor-default transition-transform duration-200 hover:scale-105 hover:z-10">
      <div className="h-36 bg-gradient-to-br from-[#1a2a1a] to-[#1a1a2a] flex items-center justify-center">
        <span className="text-white/20 text-4xl font-bold select-none">
          {item.company.charAt(0)}
        </span>
      </div>

      <div className="absolute inset-0 bg-[#141414] opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-4 flex flex-col gap-2 overflow-hidden">
        <div>
          <h3 className="text-white text-sm font-semibold leading-tight">{item.company}</h3>
          <p className="text-white/50 text-xs">{item.role}</p>
          <p className="text-white/30 text-[10px]">{item.dateRange}</p>
        </div>
        <ul className="flex flex-col gap-1 mt-1">
          {item.bullets.slice(0, 3).map((b, i) => (
            <li key={i} className="text-white/50 text-[10px] leading-relaxed flex gap-1">
              <span className="text-[#e50914] shrink-0">·</span>
              <span className="line-clamp-2">{b}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-3 group-hover:opacity-0 transition-opacity duration-200">
        <h3 className="text-white text-xs font-medium">{item.company}</h3>
        <p className="text-white/40 text-[10px]">{item.role}</p>
      </div>
    </div>
  )
}

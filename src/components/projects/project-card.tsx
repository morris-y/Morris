'use client'

import { ExternalLink } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Project } from '@/lib/content'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      whileHover={shouldReduceMotion ? {} : { y: -4 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="h-full hover:shadow-lg transition-shadow flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg leading-tight">{project.title}</CardTitle>
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${project.title} (opens in new tab)`}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 flex-1">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {project.techStack.map((tech) => (
              <Badge key={tech} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>
          <div className="mt-auto pt-2 border-t border-border/50">
            <p className="text-xs font-medium text-foreground/70">
              {project.outcomes}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

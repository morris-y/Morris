'use client'

import { motion, useReducedMotion } from 'motion/react'
import { ProjectCard } from './project-card'
import { projects } from '@/lib/content'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function ProjectsGrid() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      variants={shouldReduceMotion ? {} : containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {projects.map((project) => (
        <motion.div
          key={project.title}
          variants={shouldReduceMotion ? {} : itemVariants}
          transition={{ duration: 0.5 }}
        >
          <ProjectCard project={project} />
        </motion.div>
      ))}
    </motion.div>
  )
}

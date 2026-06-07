import { TimelineItem } from './timeline-item'
import { experience } from '@/lib/content'

export function Timeline() {
  return (
    <div className="relative border-l border-border pl-4 space-y-10">
      {experience.map((item, index) => (
        <TimelineItem key={`${item.company}-${item.role}`} item={item} index={index} />
      ))}
    </div>
  )
}

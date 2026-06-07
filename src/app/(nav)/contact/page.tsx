import type { Metadata } from 'next'
import { SocialLinks } from '@/components/contact/social-links'

export const metadata: Metadata = {
  title: 'Contact — Morris Yang',
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Contact</h1>
      <p className="text-muted-foreground mb-10">
        {"Let's build something interesting together."}
      </p>
      <SocialLinks />
    </div>
  )
}

'use client'

import dynamic from 'next/dynamic'

const Desktop = dynamic(
  () => import('@/components/desktop/desktop').then((m) => ({ default: m.Desktop })),
  {
    ssr: false,
    loading: () => <div className="fixed inset-0 bg-[#0d1117]" />,
  }
)

export default function DesktopPage() {
  return <Desktop />
}

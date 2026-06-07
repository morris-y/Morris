export interface Project {
  title: string
  description: string
  techStack: string[]
  outcomes: string
  url?: string
}

export interface ExperienceItem {
  company: string
  role: string
  dateRange: string
  description: string
  bullets: string[]
}

export interface Skill {
  label: string
  category: 'domain' | 'tech' | 'tools'
}

export interface SiteConfig {
  name: string
  tagline: string
  bio: string
  email: string
  socials: {
    x?: string
    linkedin?: string
    medium?: string
    github?: string
  }
}

export const siteConfig: SiteConfig = {
  name: 'Morris Yang',
  tagline: 'Product Builder | AI × On-chain Data × Prediction Markets',
  bio: 'I build trading products at the intersection of AI, on-chain data, and prediction markets. Currently Senior PM at Hubble AI where we shipped a prediction markets terminal generating $200k–$300k in monthly trading volume within two months — landing in the Top 50 of Polymarket Builders Program.\n\nBefore Hubble AI, I researched ZK Proofs, SocialFi, and AI infrastructure at Gate.io, shipped 27 features at Binance, and built a Web3 collaborative writing platform at NAX Lab. My background is in communications — MA from National Chengchi University — which shapes how I think about product narrative and user mental models.\n\nI\'m based in Taipei and open to remote roles or relocation.',
  email: 'zeromorris0417@gmail.com',
  socials: {
    x: 'https://x.com/MorrisSHYang',
    linkedin: 'https://linkedin.com/in/morrisy',
    medium: 'https://morrisy.medium.com',
    github: 'https://github.com/morris-y',
  },
}

export const projects: Project[] = [
  {
    title: 'Prediction Markets Trading Terminal',
    description:
      'AI-powered trading terminal for prediction markets built at Hubble AI. Achieved $200k–$300k monthly trading volume within 2 months of launch. Selected for Top 50 of the Polymarket Builders Program.',
    techStack: ['Next.js', 'Solana', 'Polymarket', 'AI', 'TypeScript'],
    outcomes: '$200k–$300k/mo volume · Top 50 Polymarket Builders',
    url: 'https://hubble.finance',
  },
  {
    title: 'Hubble AI Platform',
    description:
      'On-chain data infrastructure for AI agents with a Solana-first architecture. Led strategy across API, Dashboard, AI Assistant, MCP, and Telegram Bot products. Reduced data latency from 3–5s to sub-1s.',
    techStack: ['Solana', 'Next.js', 'TypeScript', 'MCP', 'AI Agents'],
    outcomes: '3–5s → sub-1s data latency · Multi-product portfolio',
  },
]

export const experience: ExperienceItem[] = [
  {
    company: 'Hubble AI',
    role: 'Senior Product Manager',
    dateRange: 'Feb 2026 – Present',
    description: 'Leading prediction markets terminal product',
    bullets: [
      'Grew trading terminal to $200k–$300k monthly volume within 2 months with a 2-person team',
      'Selected as Top 50 in Polymarket Builders Program',
      'Drove product strategy for AI-assisted trading workflows',
    ],
  },
  {
    company: 'Hubble AI',
    role: 'Product Manager & QA Engineer',
    dateRange: 'Mar 2025 – Feb 2026',
    description: 'Multi-product portfolio across data and AI tools',
    bullets: [
      'Led strategy for API, Dashboard, AI Assistant, MCP, and Telegram Bot products',
      'Drove Solana-first data architecture reducing latency from 3–5s to sub-1s',
      'Established QA processes for rapid iteration cycles',
    ],
  },
  {
    company: 'Gate.io',
    role: 'Researcher & Technical Writer',
    dateRange: 'Feb 2024 – May 2024',
    description: 'Blockchain and Web3 infrastructure research',
    bullets: [
      'Published 15+ research reports covering ZK Proofs, Coprocessors, SocialFi, AI, Data, GameFi, and Account Abstraction',
      'Built deep knowledge of emerging cryptographic and blockchain primitives',
    ],
  },
  {
    company: 'Binance',
    role: 'Product Manager (Contract)',
    dateRange: 'Dec 2022 – Jun 2023',
    description: 'Feature development for global crypto exchange',
    bullets: [
      'Shipped 27 product features across multiple surface areas',
      'Improved localization coverage and user-facing error message quality',
    ],
  },
  {
    company: 'NAX Lab',
    role: 'Product Manager (Part-time)',
    dateRange: 'Jun 2022 – Nov 2022',
    description: 'Web3 collaborative writing platform',
    bullets: [
      'Conducted product research and competitive analysis for Web3 writing platform',
      'Built Figma prototypes for core user flows',
    ],
  },
]

export const skills: Skill[] = [
  { label: 'Product Management', category: 'domain' },
  { label: 'Prediction Markets', category: 'domain' },
  { label: 'On-chain Data', category: 'domain' },
  { label: 'AI Agents', category: 'domain' },
  { label: 'Solana', category: 'tech' },
  { label: 'Web3 / Blockchain', category: 'tech' },
  { label: 'Trading Systems', category: 'domain' },
  { label: 'Go-to-Market', category: 'domain' },
  { label: 'TypeScript', category: 'tech' },
  { label: 'Next.js', category: 'tech' },
  { label: 'Data Analytics', category: 'domain' },
  { label: 'MCP', category: 'tech' },
  { label: 'Figma', category: 'tools' },
  { label: 'ZK Proofs', category: 'tech' },
]

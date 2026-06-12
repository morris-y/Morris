# Hubble AI PM Experience Materials

> Purpose: This document collects Morris's Hubble AI product-management work into reusable source material for future portfolio pages, case studies, resume bullets, and interview narratives.

## Summary

Morris worked on Hubble AI as a PM across product strategy, roadmap planning, requirements gathering, design specification, development coordination, metrics definition, business development, and internal process building.

The work centered on helping Hubble move from a technical, infrastructure-led company toward a product- and business-led AI/on-chain data platform. Key product surfaces included API, MCP, Dashboard, Telegram Bot, AI Assistant, KYT, Stream, Text-to-SQL, Holders Tracker, and later prediction-market and AI-agent workflows.

## Core Positioning

Hubble AI can be described as:

> A real-time blockchain data infrastructure and AI analytics platform focused on Solana and on-chain intelligence, helping developers, research teams, trading teams, and AI agents turn raw blockchain data into actionable decisions.

Morris's PM role can be described as:

> Product Manager responsible for transforming fragmented Web3 data products into a coherent AI/on-chain data platform, aligning product strategy, technical roadmap, partner requirements, monetization, and cross-functional execution.

## Main Product Areas

- API: On-chain data APIs for partners, developers, and internal AI workflows.
- MCP: Model Context Protocol interface for exposing Hubble data and tools to AI agents.
- Dashboard: Analytics and operational surface for wallet, token, and market intelligence.
- TG Bot: Telegram-based user interface for lightweight data access and alerts.
- AI Assistant: Natural-language interface for on-chain data exploration, RAG, and Text-to-SQL workflows.
- KYT: Risk tagging, wallet screening, fund-flow tracking, alerting, and visualization.
- Stream: Low-latency data stream product using WebSocket and Kafka-style enterprise delivery.
- Text-to-SQL: Natural-language query layer for partners such as MOSS, Unifai, and PANews.
- Holders Tracker: Dashboard for token holder behavior, wallet segmentation, UGC wallet lists, and trading signals.

## PM Function Map

### Product Strategy & Vision

- Designed a systematic evaluation framework for Hubble's fragmented product portfolio, including API, MCP, Dashboard, TG Bot, and AI Assistant.
- Clarified each product's purpose, target users, pain points, potential paying customers, monetization potential, and strategic value.
- Positioned AI Assistant and MCP as both B2B AI-agent demos and potential standalone products.
- Helped define a company-level objective around seed-stage valuation growth, with focus areas across product optimization, market validation, brand building, and fundraising readiness.
- Pushed a Solana-first data architecture strategy, targeting a shift from 3-5 second latency toward roughly sub-1 second latency through token-level WebSocket push and Kafka streaming.

### Product Roadmap & Prioritization

- Led product-line review and prioritization across MCP, AI Assistant, TG Bot, KYT, Stream, Holders Tracker, API, and Dashboard.
- Proposed a repeatable roadmap decision process based on structured questionnaires and data-informed evaluation.
- Prioritized Solana historical data, API coverage, DEX coverage, real-time streaming, KYT modules, and holder-analysis products.
- Coordinated resource planning with 2 backend engineers and 2 frontend engineers.
- Ran bi-weekly Scrum sprint planning using Planning Poker, Story Points, and Notion formulas/rollups to track team capacity and unfinished work.

### Requirements & Stakeholder Management

- Gathered and translated partner/customer needs into actionable product requirements.
- Jupiter requirements included Holders API, Transaction API, and Social Tagging.
- Unifai, MOSS, PANews, and Metora requirements included Text-to-SQL API improvements and transaction parsing.
- Quant desk requirements included custom historical datasets and factor extraction.
- Research-team requirements included signal discovery and wallet-behavior filtering.
- KYT-provider requirements included real-time Stream monitoring.
- Created professional external outreach for Bubblemaps API access and suggested Telegram group setup.
- Designed an Opinion Labs pitch positioning Hubble as a Goldsky-like data partner that could help avoid subgraph latency, reorg, and RPC reliability issues.

### User Research & Market Analysis

- Defined external-facing metrics for marketing/global teams, including user growth, activity, retention, engagement, partner count, and UGC wallet-list engagement.
- Researched pricing models from Nansen, Ave, Bitquery, Dune, and other data providers.
- Produced pricing recommendations including a $99 Pro plan, PAYG, and dual-dimension credit model.
- Helped articulate use cases for institutional research teams, quant desks, KYT providers, and trading teams.
- Analyzed high-frequency wallet behavior and the product implications of wallet-level market signals.

### Product Design & Specification

- Designed Holders Tracker Dashboard flows, including Explore -> Stickman token -> AI + Wallet Manager filters.
- Specified wallet segments such as Early Buyers and Diamond Hands.
- Proposed UGC Public Wallet Lists with Star/Fork behavior and personal wallet lists.
- Defined advanced time-range selection for K-line chart workflows.
- Redesigned backend data structures, including campaign_interaction_twitter_user with interaction_type and weight fields.
- Optimized TwitterUser and campaign_tweet_interaction tables with indexes and uniqueness constraints.
- Supported Solana partitioned-table design and permission management, including tables such as hubble_v2.sol_fund_source.
- Provided production-grade frontend design guidance covering layout, interaction, animation, hover states, toast behavior, and avoiding generic AI aesthetics.
- Built process templates such as Notion bug-report fields, single Kanban database structure, Type-based filters, and Story Point calculation rules.

### Development Coordination & Launch

- Defined division of labor between Hubble and MOSS: Hubble owned backend RAG/Text-to-SQL APIs and degen-perspective optimization; MOSS owned frontend rendering.
- Helped guide containerd and Kubernetes deployment practices for Hubble data pipelines and API services.
- Pushed technical improvements such as API abstraction, automatic error handling, RAG knowledge base integration, and Solana latency optimization.
- Created weekly Notion toggle-list progress reports across meetings, requirements gathering, product design, project coordination, and QA.
- Separated bug workflows from general product tickets to improve iteration clarity.

### Metrics, Analytics & Iteration

- Supported database queries and analytical investigations such as identifying wallets with high trading frequency.
- Helped define KPI categories for product performance, including data-processing speed, user growth, retention, partner adoption, and UGC engagement.
- Connected latency and data freshness to product trust, trading usage, and market-event workflows.

### Business Development & Monetization

- Proposed B2B monetization paths for KYT, including Arkham-style risk labels, real-time risk screening, fund-flow tracking, visualization, and automated alerts.
- Supported fundraising-readiness narratives for top-tier VC conversations.
- Helped frame Hubble's positioning around AI agents, on-chain data, and Solana real-time infrastructure.

### Team Leadership & Process Improvement

- Wrote a Product Intern JD emphasizing Solana/EVM data knowledge, database skills, AI tools, vibe coding, competitive analysis, customer requirement alignment, and proactive ownership.
- Established Scrum practices, sprint naming, unfinished-story handling, Notion project management workflows, and Kanban best practices.
- Acted as requirements translator, prioritization owner, external communication window, and internal process builder.

## Case Study 1: Product Portfolio Strategy Framework

### Background

By August 2025, Hubble's product line had become fragmented. Core products included API, MCP, and Dashboard, while newer products such as TG Bot and AI Assistant emerged from specific opportunities: Sahara AI collaboration, competitions, and customer requests.

The team lacked a unified framework for deciding why each product should exist, who it served, what pain point it solved, who would pay for it, and how it contributed to the roadmap.

### PM Actions

- Identified product-line fragmentation as a strategic risk.
- Proposed a systematic product evaluation framework.
- Built a questionnaire-style template covering purpose, target users, pain points, solution, paying customer, monetization potential, strategic value, and company-goal alignment.
- Required new products and features to pass through the framework before entering the roadmap.
- Highlighted that MCP and AI Assistant could work both as B2B AI-agent demos and as independent user-facing products.
- Planned management discussions after standups to build company-level alignment.

### Outputs

- Reusable Notion questionnaire template.
- Product categorization of AI Assistant, MCP, and TG Bot as potentially independent modules instead of secondary add-ons.
- A fixed questionnaire + data-driven decision process for future roadmap planning.

### Impact

The framework helped Hubble move from a technology-driven product habit toward a strategy-driven product operating system, improving prioritization and supporting future fundraising and B2B expansion.

### PM Competencies

- Product vision
- Stakeholder alignment
- Prioritization framework
- Data-driven decision making
- Portfolio strategy

## Case Study 2: Solana-First Data Architecture Strategy

### Background

Hubble's latency was around 3-5 seconds, which was not enough for institutional users, quant teams, or real-time monitoring use cases. Morris pushed Solana as the first priority because Solana's data complexity and speed requirements created a clear wedge for Hubble.

The target was to deliver a new data architecture by late 2025, reduce latency toward roughly sub-1 second, and support token-level WebSocket push plus Kafka streaming.

### PM Actions

- Defined the Solana-first architecture as a strategic priority.
- Created external communication messages describing current capability, future goals, documentation links, and planned upgrades.
- Clarified four core upgrade areas: historical data completeness, API coverage, DEX coverage, and real-time streaming.
- Connected the architecture roadmap to B2B use cases such as KYT, Stream, and Holders Tracker.
- Positioned Hubble against data providers such as Allium and other enterprise-grade on-chain infrastructure providers.

### Outputs

- Professional external pitch messages in detailed and concise versions.
- Clear delivery timeline and technical targets.
- Token-level WebSocket push and Kafka/Confluent-style enterprise streaming direction.

### Impact

The strategy strengthened Hubble's competitive position in the Solana ecosystem and created a technical foundation for higher-value products such as KYT, Stream, AI agents, and institutional analytics.

### PM Competencies

- Market prioritization
- Technical roadmap planning
- Go-to-market messaging
- Competitive positioning
- B2B product strategy

## Resume Bullets: Full STAR Version

Role: Product Manager, Hubble AI  
Date range: June 2025 - January 2026, or actual dates  
Location: Remote / Taipei

- Led product strategy overhaul for Hubble's fragmented product portfolio, including API, MCP, Dashboard, TG Bot, and AI Assistant, by designing a systematic evaluation framework to clarify purpose, target users, pain points, and monetization potential, resulting in clearer alignment on 2B focus and positioning AI Assistant + MCP as high-value B2B AI-agent demos.
- Defined company-level OKRs to support 10x valuation growth in seed round stage by breaking down goals into four phases: product optimization, market validation, brand building, and fundraising readiness.
- Drove Solana-first data architecture initiative to reduce data latency from 3-5 seconds toward a sub-1 second target by 2025 Q4, incorporating token-level WebSocket push and Kafka streaming to strengthen Hubble's competitive positioning as a Solana data provider.
- Prioritized and maintained product roadmap across MCP, AI Assistant, TG Bot, KYT, Stream, and Holders Tracker using data-driven questionnaires and Scrum processes with bi-weekly sprint planning, Planning Poker, and automated Story Point calculation in Notion.
- Gathered and translated complex stakeholder requirements from partners including Jupiter, Unifai, MOSS, PANews, Opinion Labs, and Sahara AI into actionable product specifications such as Holders API, Transaction API, Text-to-SQL enhancements, and custom historical datasets.
- Spearheaded business-development efforts by crafting professional outreach, including Bubblemaps API access request and Opinion Labs pitch, and by designing Web3-specific Sahara AI collaboration tasks to improve RAG and Text-to-SQL accuracy.
- Designed key product features and specifications for Holders Tracker Dashboard, including AI + Wallet Manager filters for Early Buyers and Diamond Hands, UGC Public Wallet Lists with Star/Fork functionality, and advanced time-range K-line selection.
- Optimized backend data structures and processes by redesigning tables such as campaign_interaction_twitter_user with interaction_type and weight fields, supporting Solana partitioned tables, and establishing Notion-based workflows for bugs vs. tasks.
- Coordinated cross-functional development and launch by defining clear division of labor with MOSS team, where Hubble owned backend RAG/Text-to-SQL APIs and degen-perspective optimization while MOSS owned frontend rendering.
- Conducted competitive analysis and monetization strategy by researching pricing models of Nansen, Ave, Bitquery, and Dune, then recommending a tiered structure such as $99 Pro + PAYG + dual-dimension credits.
- Established agile team processes and recruited talent by creating a Product Intern JD and implementing Scrum ceremonies, single Kanban database with Type filtering, and re-prioritization mechanisms for unfinished stories.
- Supported metrics definition and external communication by identifying core indicators such as user growth, retention, partner count, and UGC engagement for marketing, fundraising, and partner-facing narratives.

## Resume Bullets: Concise Version

- Led product strategy overhaul for Hubble's multi-product portfolio, including API, Dashboard, AI Assistant, MCP, and TG Bot, establishing clearer 2B focus and monetization paths.
- Drove Solana-first data architecture initiative, targeting latency reduction from 3-5s to sub-1s with token-level WebSocket and Kafka streaming.
- Defined and prioritized product roadmap across Holders Tracker, KYT, Stream, Text-to-SQL, and AI features using data-driven evaluation and bi-weekly Scrum planning.
- Gathered and translated complex requirements from key partners such as Jupiter, Unifai, Sahara AI, and Opinion Labs into actionable specs for API, AI, and data products.
- Designed core features for Holders Tracker Dashboard, including AI-powered Early Buyers/Diamond Hands filters, UGC Public Wallet Lists, and advanced K-line time selection.
- Optimized backend data structures and workflows, redesigning tables and implementing Notion-based bug/task management to improve development efficiency and query performance.
- Conducted competitive pricing analysis of Nansen, Dune, Bitquery, and other data providers, recommending a tiered monetization model with Pro plan, PAYG, and dual credits.
- Spearheaded cross-functional execution with MOSS team, defining division of labor for RAG/Text-to-SQL backend while coordinating deployment and QA cycles.
- Established agile processes and recruited talent by creating Product Intern JD and implementing Story Point estimation, single Kanban system, and re-prioritization mechanisms.
- Supported business development and metrics definition by crafting professional outreach pitches and identifying core KPIs such as growth, retention, partner count, and UGC engagement.

## Recommended Highlight Order

For future portfolio or resume pages, the strongest stories to surface first are:

1. Solana-first data architecture initiative: technical depth, quantifiable latency target, and Web3 data-platform credibility.
2. Product strategy overhaul: senior-level strategy, product portfolio thinking, and business alignment.
3. Holders Tracker Dashboard: concrete product design output combining AI, wallet intelligence, and UGC.
4. Competitive analysis and monetization: direct commercial contribution through pricing and paid-service design.
5. Cross-functional execution with MOSS and Sahara AI: stakeholder management, AI collaboration, and delivery coordination.


# Changelog

All notable changes to Zucarlink are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.1.0.0] - 2026-03-19

### Added
- **ZucarIA RAG pipeline** — ZucarIA now searches relevant forum posts via OpenAI text-embedding-3-small embeddings and injects them as context, making answers grounded in the Zucarlink community's knowledge
- **Wiki técnica** — Community-editable technical wiki with categories (Fabricación, Maquinaria, Agronomía, Laboratorio, Electricidad, Administración), revision history, and public indexable pages; editing requires 500 reputation points or Pro plan
- **Ingeniero Pro plan** — New subscription tier ($15/mo via Stripe) with unlimited ZucarIA, verified profile badge, and premium access; full plan gate middleware for feature enforcement
- **Stripe Customer Portal** — Provider companies can now self-serve manage, upgrade, cancel, and view billing history at `/mi-suscripcion`; no more manual support for billing questions
- **Reputation system** — Forum posts can be upvoted/downvoted; authors earn +10 reputation per upvote, building a credibility signal across the community
- **SEO for forum** — Posts now have auto-generated slugs (`/foro/post/titulo-del-post`), are publicly readable without login, and have dynamic Open Graph meta tags; sitemap.xml generated automatically
- **Public engineer profiles** — Each user has a public profile at `/ingenieros/:username` showing specialization, reputation, and forum contributions
- **Analytics dashboard for providers** — Provider companies can see views on their profile, machinery listings, and job postings at `/mi-empresa/analytics`
- **Vitest test framework** — Frontend test suite bootstrapped with vitest + @testing-library/react; 7 tests covering UpgradePro, MiSuscripcion, and Wiki pages

### Fixed
- **ZucarIA security** — Removed `VITE_OPENAI_API_KEY` from frontend bundle (was exposed to any browser user); API key now lives exclusively on the backend
- **ZucarIA context windowing** — Long conversations no longer silently fail at OpenAI token limits; sliding window keeps last 20 messages
- **ZucarIA routing bug** — Frontend was calling `/zucaria/*` but backend only mounted routes at `/conversations`; fixed by adding the correct mount point
- **S3 orphan cleanup** — Deleting posts or job listings now correctly removes associated files from S3 before destroying database records
- **JWT payload** — `planType` and `reputacion` are now included in JWT so plan gate middleware and wiki edit checks work correctly without extra DB queries

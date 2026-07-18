# Vireo Insurance Compare — PRD

## Original Problem Statement
"An interactive web app tool that compares insurance from multiple providers."

## User Choices (from ask_human)
- Insurance types: **Health** and **Life**
- Data source: Realistic mock/sample provider data
- Key features: Side-by-side comparison table with filters
- Auth: None (public tool)
- Design: Clean, modern, Apple-esque, green + white palette

## Architecture
- **Backend**: FastAPI (`/app/backend/server.py`) + MongoDB (`quote_history`, `comparisons` collections)
- **Mock data**: `/app/backend/providers_data.py` — 6 health + 6 life providers
- **Frontend**: React (CRA) + Tailwind + Shadcn UI, routes at `/`
- **Design system**: Manrope (display) + Inter (body), Apple soft-grey palette, `#34C759` accent green

## User Personas
- **Individual shopper (25–45)**: comparing personal plans quickly
- **Family decision-maker (30–55)**: comparing family health plans
- **Life-event planner (30–60)**: new parent, new mortgage, buying life coverage

## Core Requirements (static)
- Compare quotes from multiple providers side-by-side
- Personalized pricing based on user inputs (age, coverage, smoker, family, term)
- Filter and sort providers
- View detailed benefits/exclusions/pros-cons per provider
- Zero signup / friction

## Implemented (v1.0 — 2026-02)
- ✅ FastAPI endpoints: `/api/providers/{category}`, `/api/quote`, `/api/comparisons`
- ✅ Deterministic quote engine (age, smoker, coverage, family, term factors)
- ✅ Landing hero with Health/Life category switch
- ✅ Live quote form (sliders + selects + smoker toggle)
- ✅ Provider grid (6 cards per category) with badge, rating, price, key stats
- ✅ Filters: max monthly premium, min rating, sort (premium/rating/deductible)
- ✅ Provider details modal (bento stats, benefits, exclusions, pros/cons)
- ✅ Multi-select (up to 4) + side-by-side comparison modal with sticky columns
- ✅ Sticky "compare selected" floating bar
- ✅ Footer with how-it-works + FAQ

## Backlog

### P1
- AI-powered "which plan suits me best?" recommendation using LLM
- Save/share comparison via URL (backend endpoint already exists)
- Deeper filters (network type, plan tier, riders)
- Auto insurance and home insurance categories

### P2
- Real quote API integration (Ethos, Policygenius partners)
- User accounts to save comparisons across devices
- Email/PDF export of comparison
- Progressive disclosure of legal disclaimers per plan
- i18n / additional locales

## Testing
- Iteration 1 (2026-02): Backend 100%, Frontend ~95% (a11y polish only). Fixed post-report.

# On Allocation Studio

A portfolio demo of an **AI-assisted allocation tool** for global sportswear retail, built as a sample project for the kind of work an allocation analyst at a brand like On might do day-to-day.

> **Disclaimer**: this is a non-commercial portfolio project. Product names and the brand "On" are © On AG, used here purely for demonstration purposes. The project is **not affiliated with or endorsed by On AG**. All inventory, sales and forecast data is **synthetic**, generated deterministically from a seed.

## What it does

Five pages, each tackling a real-world problem an allocation team faces:

1. **Dashboard** — network-wide stock health, sell-through, weekly revenue and at-risk SKUs.
2. **Products** — catalog of 12 SKUs with global stock and weeks-of-cover summary per product.
3. **Allocation recommender** — suggested store-to-store transfers based on demand forecast vs current cover, with reasoning (stock-out risk, overstock, marketing campaign, seasonality).
4. **Demand forecast** — 8-week forecast per product/region with marketing-spend overlay (the "marketing-aware allocation" thesis).
5. **Scenario simulator** — interactive sliders to explore the impact of marketing-spend changes, lead time and target weeks-of-cover.

## Languages

The app ships in 7 languages: **English, German, French, Italian, Spanish, Japanese, Portuguese**, covering On's core HQ and retail markets.

## Stack

- Next.js 16 (App Router, RSC, static export per locale)
- next-intl 4 for i18n routing and translation
- Recharts for visualisations
- Tailwind v4 + shadcn-style primitives
- Lucide for iconography
- TypeScript end-to-end
- Deployed on Vercel

## Local development

```bash
npm install
npm run dev
# http://localhost:3000
```

```bash
npm run build   # static generation for all 7 locales
npm start
```

## Project structure

```
src/
  app/[locale]/           # localised routes (Dashboard, Products, Allocation, Forecast, Simulator)
  components/             # UI primitives + Recharts wrappers
  data/                   # synthetic dataset (products, locations, time series)
  i18n/                   # next-intl routing and request config
  messages/               # translation JSON per locale
  proxy.ts                # locale negotiation (Next 16 proxy convention)
```

## Why this project

Allocation sits between supply chain, retail and marketing. The most interesting questions there are not "how much stock do we have" but **"where should it be next month, and how does the marketing plan change that answer?"** This demo focuses on that bridge between marketing signal and inventory decisions.

# Development log

A running log of the design and engineering decisions behind **On Allocation Studio**, intended both as documentation for future work and as transparency about the trade-offs made for a portfolio demo.

---

## Goal

Build a public, shareable demo of an **AI-assisted allocation tool** to attach to a job application for an Allocation Analyst role at On (Swiss sportswear). The demo should:

- Show I understand the **core problem** of an allocation team (where stock should sit, when to redistribute, how marketing changes that answer).
- Be **shareable as a single URL** to a hiring manager who has not invited me to interview yet.
- Look **production-grade** in design and copy, not a Streamlit notebook.
- Be **multilingual** to match On's HQ in Zurich (DE) and core retail markets (EN, FR, IT, ES, JA, PT).

---

## Scope: which project to build

Four candidate projects were considered:

1. **AI Allocation Engine** — recommend stock distribution per product/region.
2. **Marketing Spend → Demand Impact Model** — incorporate marketing spend in forecasts.
3. **Product Performance Segmentation** — fast vs slow movers, elasticity per product.
4. **Allocation Experimentation Framework** — A/B test allocation strategies.

**Decision**: build **#1 with #2 embedded**. Reasons:

- #1 is the core function of the role — must demonstrate it on day 1.
- #2 leverages my marketing background as a differentiator from supply-chain-only candidates.
- #3 and #4 fit better as "future roadmap" slides than as half-built demos.
- A polished, focused demo wins over an ambitious-but-rough prototype for a hiring manager.

---

## Stack choice

**Decision**: Next.js 16 + next-intl 4 + Recharts + Tailwind v4 + TypeScript, deployed on Vercel.

| Considered            | Chosen      | Why                                                                                                        |
| --------------------- | ----------- | ---------------------------------------------------------------------------------------------------------- |
| Streamlit / Dash      | Next.js     | Streamlit ships polished Python demos but locale handling is painful and the look is "internal tool", not "shipped product". |
| react-i18next         | next-intl   | next-intl is purpose-built for the App Router, with first-class locale routing and message-format support. |
| Tremor                | Recharts    | Tremor is sleeker out of the box but Recharts gives finer control for the composed forecast chart.         |
| shadcn/ui (full)      | shadcn-style primitives written in-line | Avoided the shadcn CLI dependency for a small project; matched the visual language manually with Tailwind. |
| Netlify               | Vercel      | Native Next.js host, zero-config deploy, free tier, faster cold starts.                                    |

---

## Languages

**Decision**: ship in 7 locales: `en, de, fr, it, es, ja, pt`.

| Locale | Why                                                                  |
| ------ | -------------------------------------------------------------------- |
| `en`   | Default; corporate language at On.                                   |
| `de`   | Zurich HQ + DACH retail.                                             |
| `fr`   | French market + Paris flagship + Swiss French.                       |
| `it`   | Italian market + Milan flagship.                                     |
| `es`   | Spain + LatAm.                                                       |
| `ja`   | Tokyo flagship + Japan growth market.                                |
| `pt`   | Brazil (São Paulo) + Portugal.                                       |

Catalan was considered (my native language and Laia's), but skipped to avoid implying a personal angle in a professional demo. Easy to add in 5 min if needed.

---

## Image / IP handling

The demo could have used On's real product photos via their CDN. **Decision**: do NOT use any On copyrighted imagery, even hot-linked.

Three options were weighed:

- **A)** Hot-link On's CDN — easy, looks great, but legally questionable for a public portfolio.
- **B)** Use On's public press kit with a clear disclaimer — better, but still requires re-uploading copyrighted assets.
- **C)** Generate stylised SVG shoe marks per product, colour-coded — fully original assets, zero IP risk.

**Chose C.** Built a single `ShoeMark` SVG component that takes a colour and renders a simple sole-and-laces silhouette. Each product has a brand-evocative colour. Combined with a disclaimer in the footer ("Demo project · Not affiliated with On AG · Product names are © On AG, used for non-commercial demonstration") this is the safest and most professional choice.

---

## Data model

All data is **synthetic**, generated deterministically from a seeded RNG (mulberry32). This means:

- Reproducible across deploys (no flicker between page loads).
- No external API or DB needed — everything renders server-side from pure functions.
- Easy to inspect and reason about for anyone reading the source.

### Entities

- **Products** (12): real On SKU names with realistic CHF prices and per-region demand bias.
- **Locations** (11): real cities mapped to On's actual retail footprint (Zurich, Berlin, London, Paris, Milan, Barcelona, NYC, Portland, São Paulo, Tokyo, Melbourne) with region (EMEA / AMER / APAC) and a `scale` factor.
- **Sales** (52 weeks × 12 products × 11 locations): generated with seasonality (sine wave peaking in spring/summer for road running), regional marketing campaigns (Berlin Marathon, NYC Marathon, Tokyo Marathon, etc.), product-specific trend lifts, and noise.
- **Inventory**: derived from recent velocity × randomised target weeks-of-cover → produces realistic mix of healthy / stock-out / overstock SKU-locations.
- **Marketing spend** (52w + 8w forecast): per region, with campaign spikes that align to the sales lift.
- **Forecast** (8w): naive moving-average × seasonality × campaign factor, plus a widening confidence band.
- **Allocation recommendations**: derived from inventory rows with `weeksCover < 2.5` paired with rows of the same SKU at `weeksCover > 10`, calculating realistic transfer quantities and tagging a reason.

### Why this shape

These are the **decisions an allocation team actually makes**:

- "Are we healthy globally?" → Dashboard KPIs.
- "Which SKUs are dying / on fire?" → Top movers + at-risk lists.
- "Where should I move stock right now?" → Allocation recommender.
- "What does next quarter look like?" → Forecast.
- "What if we double the marketing spend in DACH for the Berlin Marathon?" → Simulator.

---

## Pages

| Page             | Server / Client | What it demonstrates                                                       |
| ---------------- | --------------- | -------------------------------------------------------------------------- |
| Dashboard        | Server (RSC)    | KPI literacy, network-level thinking, ability to design an executive view. |
| Products         | Server          | Catalog UX, per-SKU summary, traffic-light cover signals.                  |
| Allocation       | Server          | The core deliverable: actionable recommendations with reasoning.           |
| Forecast         | Client wrapper  | Time-series visual with overlay of marketing spend (the differentiator).   |
| Simulator        | Client          | Decision-support thinking: what-if sliders → impact on KPIs.               |

---

## Notable Next.js 16 specifics

The starter shipped with Next.js 16.2.4, which has breaking changes from training-data-era versions:

- **`middleware.ts` is deprecated**, renamed to `proxy.ts`. Same function shape, new file convention.
- **`params` is now async** — every layout and page must `await params`.
- **`PageProps<'/[locale]'>`** and **`LayoutProps<'/[locale]'>`** are globally available type helpers (no import needed).
- next-intl 4 still exports `createMiddleware`; the function works inside `proxy.ts` unchanged — only the file name is new.

These are flagged in the repo's `AGENTS.md` so future contributors don't fall back to old patterns.

---

## What was deliberately NOT built

To keep the demo focused and shippable:

- No auth — public read-only demo.
- No DB — all data is synthetic and in-memory.
- No real ML model — forecast is a transparent heuristic (moving avg × seasonality × campaign). A real role would use Prophet / XGBoost / a state-space model; here, transparency > sophistication.
- No mobile-optimised allocation table — desktop-first because that's where the real users work.
- No write actions (approve/reject buttons in Allocation are read-only) — would add complexity without showing more skill.

---

## Open follow-ups

- [ ] Add a "Methodology" page explaining how each metric is computed.
- [ ] Add download-CSV buttons to the Allocation table.
- [ ] Add a Map view for the Locations data using react-simple-maps.
- [ ] Wire a real Prophet forecast (Python service) behind the Forecast page to demonstrate end-to-end ML integration.
- [ ] Add a screen recording / Loom in the README for hiring managers who don't click through demos.

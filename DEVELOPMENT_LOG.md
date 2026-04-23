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

- **Products** (25): real On SKU names, including women's variants and 3 "new-in" launches mid-year (Cloudtilt, Cloudboom Echo 3, Cloudsurfer Trail). Each carries category, gender, price, **COGS**, regional demand bias, lead-time in weeks and an optional launch-week marker.
- **Locations** (23): real cities mapped to On's actual footprint plus three operational tiers:
    - 11 **flagship** stores (Zurich HQ, Berlin, London, Paris, Milan, Barcelona, NYC, Portland, São Paulo, Tokyo, Melbourne)
    - 3 **distribution centres** (Antwerp / EMEA, Atlanta / AMER, Yokohama / APAC)
    - 6 **wholesale partners** (Foot Locker DE, JD Sports UK, Intersport FR, Dick's US, REI US, ABC-Mart JP)
    - 3 **e-commerce** channels, one per region
- **Sales** (52 weeks × 22 selling locations × 25 products): seasonality (sine wave with category-specific phase shift — hike peaks autumn, lifestyle is flatter, road peaks spring/summer), regional + product-launch + black-friday + boxing-day + lunar-new-year + back-to-school campaigns, product-specific trend lifts (Cloudboom Strike accelerating, Cloudgo declining), and noise. Warehouses do not sell, only ship.
- **Inventory**: per (product × location), derived from recent velocity × randomised target weeks-of-cover. Wider noise than v1 (cover spans 0.5–19 weeks) so the recommender always finds genuine stock-outs to surface.
- **Inventory by size**: each row exploded across 10 EU sizes (36–45) using gender-specific demand curves (women's curve peaks at 38–39, unisex at 41).
- **Marketing spend** (52w + 8w forecast): per region with campaign spikes that align to the sales lift.
- **Forecast** (8w): naive moving-average × seasonality × campaign factor, plus a widening confidence band.
- **Forecast accuracy**: rolling 8-week MAPE (mean absolute percent error) computed from a moving-average baseline replayed against actuals.
- **Allocation recommendations**: derived by pairing low-cover store rows (`weeksCover < 2.5`) with high-cover sources (`weeksCover > 8 & units > 30`), preferring **same-region warehouses → store** over inter-store transfers and computing a realistic transfer quantity. Each rec is enriched with origin/destination velocity, cover before/after, an upcoming-campaign label, **expected revenue lift** and **expected margin lift** (transfer × price × sell-through probability). Reason is one of `stockOut`, `overstock`, `campaign`, `seasonality`.
- **Purchase orders in transit**: a generated set of POs from supplier (Vietnam) → DC and DC → store, each with units and ETA in weeks. Surfaces on the dashboard so the user knows what's already on the way before approving more transfers.

### Why this shape

These are the **decisions an allocation team actually makes**:

- "Are we healthy globally?" → Dashboard KPIs (stock health %, sell-through, revenue, **margin**, in-transit, **MAPE**, new-in count).
- "Which SKUs are dying / on fire?" → Top movers + at-risk lists.
- "Where should I move stock right now?" → Allocation recommender (now interactive — see below).
- "Is the demand prediction we're acting on actually any good?" → Forecast MAPE KPI + the Forecast page chart with confidence band.
- "What does next quarter look like?" → Forecast.
- "What if we double the marketing spend in DACH for the Berlin Marathon?" → Simulator.
- "What stock is already on the way?" → In-transit POs panel.

---

## Campaigns and signals

Marketing spend is the differentiator of this project (vs a pure supply-chain tool). 15 calendar moments are encoded; each has a region, centre week, lift multiplier, and optional category or product filter:

- **Marathons**: Berlin (W14), London (W16), Boston (W14), NYC (W38), Tokyo (W6) — lift `road` SKUs in the host region.
- **Cultural**: Lunar New Year (W4 APAC, lifestyle), Boxing Day (W51 EMEA, all), Black Friday (W47 ALL).
- **Retail moments**: Back to school (W35 AMER, training), Holiday lifestyle push (W46 EMEA, lifestyle), Hike season (W40 EMEA, hike), Summer trail launch (W22 AMER, trail).
- **Product launches**: Cloudtilt (W18 EMEA, lifestyle), Cloudboom Echo 3 (W30 ALL, road), Cloudsurfer Trail (W38 EMEA, trail).

Lifts decay smoothly with a Gaussian centred on the campaign week (±3 weeks of influence). Marketing spend per region is recomputed from these so the spend overlay on the Forecast page lines up with the demand lift — making the marketing-aware story visually obvious.

---

## Pages

| Page             | Server / Client     | What it demonstrates                                                                                                                                          |
| ---------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard**    | Server (RSC)        | 8 KPI cards (health, sell-through, stock-outs, revenue, **margin**, **in-transit**, **MAPE**, new-in), sales-by-region area chart, cover-by-region bars, top movers, at-risk SKUs, **in-transit POs** panel. |
| **Products**     | Server              | 25-card catalog grid; each card has category, gender, price, global stock, weeks-of-cover (traffic-light coloured), a "New" badge for launches, and a per-product **size-grid mini chart** (10 sizes, red bars where any location is stocked-out for that size). |
| **Allocation**   | Server → Client     | Interactive review console (see "Iteration 2" below).                                                                                                          |
| **Forecast**     | Client wrapper      | 26-week actual + 8-week forecast time-series with marketing-spend bar overlay, product and region selectors, confidence band.                                 |
| **Simulator**    | Client              | Sliders for marketing-spend multiplier, replenishment lead time, target weeks-of-cover → live KPI cards for expected sales, revenue, stock-out risk and recommended transfer. |

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
- No persistence of approvals — Allocation approve/reject is client-side only. Adding a backend would not show more skill on this scope.
- No mobile-optimised allocation table — desktop-first because that's where the real users work.

---

## Iteration 2 — Data realism + interactive Allocation

The first version (initial commit + DEVELOPMENT_LOG v1) shipped a clean but thin demo. This iteration was driven by the question *"if I were a hiring manager looking at this for two minutes, would I believe this person knows what allocation actually involves?"*. Three additions came from that:

### 2a. Dataset realism

| Before                                   | After                                                                                                              |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 12 SKUs                                  | **25** SKUs (added women's variants, 3 launches with `isNewIn` + `launchWeek`, two more lifestyle and trail SKUs) |
| 11 flagship stores                       | **23** locations across 4 channel types: flagship + warehouse (Antwerp/Atlanta/Yokohama) + 6 wholesale partners + 3 e-commerce sites |
| Single seasonality curve                 | **Per-category** seasonality (hike peaks autumn, lifestyle flatter, road peaks spring/summer)                      |
| 5 marketing campaigns                    | **15** campaigns + 3 product launches with category/product filters                                                |
| Price only                               | Price + **COGS** → margin computable per SKU                                                                       |
| Aggregate inventory                      | Aggregate **and** per-size inventory using gender-specific demand curves                                           |
| —                                        | **Purchase orders in transit** model (supplier→DC and DC→store, with ETAs)                                         |
| —                                        | **Forecast MAPE** rolling metric                                                                                   |

### 2b. Interactive Allocation page

The first version was a static table — useful to look at, useless to demo. Rewrote the page as a real review console:

- **Sticky summary cards**: open recs, units to move, **expected revenue lift**, **expected margin lift**. All recompute live from the visible/pending rows when filters or approvals change.
- **Filter bar**: free-text search by product or city, region selector, channel selector, reset.
- **Click-to-expand row**: each recommendation opens a 3-column detail view showing
    1. **Origin** — current units + cover + channel,
    2. **Destination** — sell velocity, cover before → after, last-8-weeks sparkline,
    3. **Expected impact** — revenue & margin numbers and the campaign label that triggered the rec.
- **Approve / Reject** buttons (client-side state). Approved rows turn subtly green; rejected rows fade out. Counters appear in the toolbar. State resets via the Reset button.
- **Reason badges** at row level — red `STOCK-OUT` or amber `<campaign label>` so the operator sees in one glance why each rec was raised.

### 2c. Why this matters for the demo

This is how an Allocation Analyst would describe their day in an interview: *"I look at the recommender, filter to my region, expand each rec to verify the data, approve the obvious ones, leave the borderline cases for the buyer to discuss."* The page now lets me literally walk through that flow on screen.

### 2d. Bug discovered + fixed

Right after pushing the dataset expansion, the Allocation page rendered zero recommendations. Diagnosis: the inventory-cover formula was `(4 + rand()*8) × (0.6 + rand()*0.9)`, whose minimum value is `4 × 0.6 = 2.4` — just above the `< 2.5` threshold that defines a "low cover" row. Before the expansion, the random spread happened to dip below by chance; with the larger, re-seeded dataset it never did. Widened the inventory generation to `(1.5 + rand()*9) × (0.4 + rand()*1.4)` so the bottom of the distribution genuinely produces stock-outs, yielding ~70 candidate recommendations across the 24 SKUs and 20 selling locations.

The lesson worth recording: thresholds in synthetic data should always be inside the achievable range of the generator, not at its boundary. Easy to miss because the original seed accidentally satisfied it.

---

## Open follow-ups

- [ ] Add a "Methodology" page explaining how each metric is computed.
- [ ] Add download-CSV button to the Allocation table (export the approved set).
- [ ] Add a Map view for the Locations data using react-simple-maps or D3.
- [ ] Wire a real Prophet forecast (Python service) behind the Forecast page to demonstrate end-to-end ML integration.
- [ ] Add a screen recording / Loom in the README for hiring managers who don't click through demos.
- [ ] Add Catalan locale once a Catalan-speaking reviewer is on the panel.
- [ ] Add a "what changed since last week?" panel to the dashboard (deltas in stock health, MAPE, top movers).

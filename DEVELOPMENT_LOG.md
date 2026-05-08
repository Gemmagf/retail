# Development log

A running log of the design and engineering decisions behind **On Allocation Studio**, intended both as documentation for future work and as transparency about the trade-offs made for a portfolio demo.

---

## Goal

Build a public, shareable demo of an **AI-assisted allocation tool** to attach to a job application for the **Senior Retail Allocator** role at On (Swiss sportswear, Zurich HQ). The demo should:

- Show I understand the **core problem** of an allocation team (where stock should sit, when to redistribute, how marketing changes that answer).
- Be **shareable as a single URL** to a hiring manager who has not invited me to interview yet.
- Look **production-grade** in design and copy, not a Streamlit notebook.
- Be **multilingual** to match On's HQ in Zurich (DE) and core retail markets (EN, FR, IT, ES, JA, PT).
- Map **each bullet of the job description** to something the visitor can click on.

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

Catalan was considered (my native language), but skipped to avoid implying a personal angle in a professional demo. Easy to add in 5 min if needed.

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
- **Sales** (52 weeks × 22 selling locations × 25 products): seasonality (sine wave with category-specific phase shift — hike peaks autumn, lifestyle flatter, road peaks spring/summer), regional + product-launch + black-friday + boxing-day + lunar-new-year + back-to-school campaigns, product-specific trend lifts (Cloudboom Strike accelerating, Cloudgo declining), and noise. Warehouses do not sell, only ship.
- **Inventory**: per (product × location), derived from recent velocity × randomised target weeks-of-cover. Noise widened deliberately (cover spans 0.5–19 weeks) so the recommender always finds genuine stock-outs to surface.
- **Inventory by size**: each row exploded across 10 EU sizes (36–45) using gender-specific demand curves (women's curve peaks at 38–39, unisex at 41).
- **Marketing spend** (52w + 8w forecast): per region with campaign spikes that align to the sales lift.
- **Forecast** (8w): naive moving-average × seasonality × campaign factor, plus a widening confidence band.
- **Forecast accuracy**: rolling 8-week MAPE (mean absolute percent error) computed from a moving-average baseline replayed against actuals.
- **Last-year series**: a deterministic inverse-growth transform of current sales with category-specific YoY factors (Road +15%, Trail +22%, Lifestyle +28%, Training +8%, Hike +10%) — feeds the LY overlay on the Forecast chart and the `vs LY` deltas on the dashboard.
- **Allocation recommendations**: derived by pairing low-cover store rows (`weeksCover < 2.5`) with high-cover sources (`weeksCover > 8 & units > 30`), preferring **same-region warehouses → store** over inter-store transfers and computing a realistic transfer quantity. Each rec is enriched with origin/destination velocity, cover before/after, an upcoming-campaign label, **expected revenue lift** and **expected margin lift** (transfer × price × sell-through probability). Reason is one of `stockOut`, `overstock`, `campaign`, `seasonality`.
- **Missed sales**: per (product × location), combining full stock-outs (velocity × weeks-out) and per-size gaps (velocity × expected size share). Aggregated network-wide on the dashboard and per-store on the store detail page.
- **Stock imbalances**: per product, the spread between the lowest-cover and highest-cover selling stores. Monetised by COGS of the excess units × weekly carrying cost (1.5 %/w) to produce a per-SKU imbalance cost and a network total.
- **Risks & opportunities**: risks = SKU-locations predicted to stock out in 2/4/6 weeks (with revenue + margin at risk and optional campaign chip); opportunities = overstock with high redistribution potential, tagged as Overstock / Slow-moving / Idle capital.
- **Category rollup**: per category summary (SKU count, weekly revenue, weekly margin, sell-through, avg cover, stock-outs, missed revenue, 8-week sparkline) for the merchandise-planning conversation.
- **Region KPIs**: every headline KPI also computed scoped to EMEA, AMER, APAC — powers the region pill on the dashboard, which defaults to EMEA to match the role scope.
- **Purchase orders in transit**: a generated set of POs from supplier (Vietnam) → DC and DC → store, each with units and ETA in weeks. Surfaces on the dashboard and on each store's detail page so the user knows what's already on the way before approving more transfers.

### Why this shape

These are the **decisions an allocation team actually makes** — and each one now maps to a discoverable page:

| Question                                                           | Page                                   |
| ------------------------------------------------------------------ | -------------------------------------- |
| "Are we healthy globally?"                                         | `/` dashboard                          |
| "Where's the next revenue and the next failure?"                   | `/risks` (risks + opportunities)       |
| "Where should I move stock right now?"                             | `/allocation` recommender              |
| "How is each category performing?"                                 | `/categories` rollup                   |
| "What's happening at this specific store?"                         | `/stores/[storeId]` detail             |
| "Which sizes are breaking down for this product?"                  | `/sizes` heatmap                       |
| "What does next quarter look like, against last year?"             | `/forecast` with LY line               |
| "What if we double marketing spend before the Berlin Marathon?"    | `/simulator`                           |
| "What stock is already on the way?"                                | In-transit POs panel (dashboard)       |
| "Who built this and how do I reach them?"                          | `/about`                               |

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

| Page             | Route                          | Server / Client | What it demonstrates                                                                                                                                                                                |
| ---------------- | ------------------------------ | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard**    | `/`                            | Server + Client | Region pill (EMEA default), 8 headline KPIs with `vs LY` trends, imbalance-cost note, sales-by-region area chart, cover-by-region bars, top movers, at-risk SKUs, **Stock imbalances**, **Missed sales opportunities** and **in-transit POs** panels. |
| **Categories**   | `/categories`                  | Server          | Per-category (Road / Trail / Lifestyle / Training / Hike) cards with revenue, margin, sell-through, cover, stock-outs, missed revenue and 8-week unit sparkline.                                    |
| **Products**     | `/products`                    | Server          | 25-card catalog grid; each card has category, gender, price, global stock, weeks-of-cover (traffic-light), "New" badge for launches and a **per-product size-grid mini chart** (10 sizes, red bars where any location is stocked-out for that size). |
| **Stores**       | `/stores` + `/stores/[id]`     | Server          | Network-wide table of 20 selling stores with per-store SKU-health bar, at-risk + stock-out counts, avg cover, weekly revenue, missed revenue and incoming units. Each row drills into a store detail page with 4 KPIs, the full SKU table (traffic-lights, size-gap chips, incoming units) and the inbound PO list. |
| **Sizes**        | `/sizes`                       | Server + Client | **Store × size heatmap** per product. Expected demand-share bar above each column; cells show units per size-store with red for stock-outs, amber for <2w of size cover, green for healthy.         |
| **Allocation**   | `/allocation`                  | Server + Client | Demand-led methodology banner + interactive review console: filter bar, sticky summary (open recs, units to move, expected revenue lift, expected margin lift), click-to-expand rows (origin / destination / expected impact with sparkline), approve / reject client-state, status counters. |
| **Risks**        | `/risks`                       | Server + Client | Tabbed view. Risks: SKU-locations predicted to stock out in 2/4/6 weeks with revenue + margin at risk and campaign chip. Opportunities: overstock pockets tagged Overstock / Slow-moving / Idle capital. Summary cards at top. |
| **Forecast**     | `/forecast`                    | Client wrapper  | 26-week actual + 8-week forecast time-series with confidence band, **last-year line** and marketing-spend bar overlay, product and region selectors.                                                 |
| **Simulator**    | `/simulator`                   | Client          | Sliders for marketing-spend multiplier, replenishment lead time, target weeks-of-cover → live KPI cards for expected sales, revenue, stock-out risk and recommended transfer.                        |
| **About**        | `/about`                       | Server          | CV page (profile, experience, core skills, education, languages) with downloadable PDF, LinkedIn + GitHub quick links and a "Beyond work" card tying to Zurich (Limmat walks with the newly-adopted pup). |

All pages localised across 7 languages. Total static output: ≈200 pages across locales including 140 store-detail pages.

---

## How the demo maps to the JD

The role spec was read carefully and each bullet traced to something the visitor can actually click on:

| Job description ask                                                            | Where it lives                                                      |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| "Manage allocation **and replenishment**, adjust flows based on sales/stock"  | `/allocation` recommender + in-transit POs                          |
| "Support **store-level execution**"                                            | `/stores/[id]` drill-down                                           |
| "Shift from **forecast-driven to demand-led** replenishment"                   | Methodology banner + reason badges at `/allocation`                 |
| "Analyze sales, stock, and **size performance at SKU and store level**"        | `/sizes` heatmap + `/stores/[id]` size-gap chips                    |
| "Identify **missed sales opportunities**"                                      | Missed revenue KPI + dashboard panel + column on `/stores`          |
| "Identify **stock imbalances**"                                                | Imbalance cost KPI + dashboard panel + spread visual                |
| "Identify risks and opportunities **early**"                                   | `/risks` dedicated page with 2w / 4w / 6w buckets                   |
| Retail KPIs: sell-through, stock cover, size performance, ROI                  | All explicit at the top of the dashboard with `vs LY` deltas        |
| "AI-powered allocation systems"                                                | Interactive recommender with reasoning badges, demand-led copy      |
| EMEA focus                                                                     | EMEA is the default region on the dashboard pill                    |
| Collaboration central ↔ local                                                  | 7-locale UI, store-level detail, clear reasoning text               |
| Communicates complex topics simply                                             | Every KPI has a short inline explanation; methodology is explicit   |

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
- No mobile-optimised allocation or sizes tables — desktop-first because that's where the real users work.

---

## Iteration 2 — Data realism + interactive Allocation

The first version shipped a clean but thin demo. Iteration 2 was driven by *"if I were a hiring manager looking at this for two minutes, would I believe this person knows what allocation actually involves?"*

### 2a. Dataset realism

| Before                                   | After                                                                                                              |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 12 SKUs                                  | **25** SKUs (added women's variants, 3 launches with `isNewIn` + `launchWeek`, more lifestyle and trail SKUs)      |
| 11 flagship stores                       | **23** locations across 4 channel types: flagship + warehouse (Antwerp/Atlanta/Yokohama) + 6 wholesale partners + 3 e-commerce sites |
| Single seasonality curve                 | **Per-category** seasonality (hike peaks autumn, lifestyle flatter, road peaks spring/summer)                      |
| 5 marketing campaigns                    | **15** campaigns + 3 product launches with category/product filters                                                |
| Price only                               | Price + **COGS** → margin computable per SKU                                                                       |
| Aggregate inventory                      | Aggregate **and** per-size inventory using gender-specific demand curves                                           |
| —                                        | **Purchase orders in transit** model (supplier→DC and DC→store, with ETAs)                                         |
| —                                        | **Forecast MAPE** rolling metric                                                                                   |

### 2b. Interactive Allocation page

The first version was a static table — useful to look at, useless to demo. Rewrote the page as a real review console:

- **Sticky summary cards**: open recs, units to move, expected revenue lift, expected margin lift. All recompute live from the visible/pending rows.
- **Filter bar**: free-text search, region selector, channel selector, reset.
- **Click-to-expand row**: each rec opens a 3-column detail (Origin / Destination / Expected impact with sparkline).
- **Approve / Reject** buttons (client-side state). Approved rows turn green; rejected rows fade out. Counters appear in the toolbar.
- **Reason badges** at row level: red `STOCK-OUT` or amber `<campaign label>`.

### 2c. Bug discovered + fixed

Right after pushing the dataset expansion, Allocation rendered zero recommendations. Diagnosis: the inventory-cover formula was `(4 + rand()*8) × (0.6 + rand()*0.9)`, whose minimum value is `4 × 0.6 = 2.4` — just above the `< 2.5` threshold for "low cover". Before the expansion, the random spread happened to dip below by chance; after, it never did. Widened to `(1.5 + rand()*9) × (0.4 + rand()*1.4)`.

**Lesson recorded**: thresholds in synthetic data should sit *inside* the generator's achievable range, not at its boundary. Easy to miss because the original seed accidentally satisfied it.

---

## Iteration 3 — Role alignment (JD match, part 1)

After re-reading the Senior Retail Allocator JD bullet-by-bullet, the previous demo covered ~60 % of the explicit asks. Iteration 3 closed the obvious gaps.

### 3a. New pages

- **`/stores`** — EMEA-wide table of the 20 selling locations with per-store KPIs (SKU health bar, at-risk / stock-out counts, avg cover, weekly revenue, missed revenue, incoming units). Each row clicks into…
- **`/stores/[id]`** — a dedicated store view with 4 KPI tiles, the full SKU table at that store (cover traffic-lights, size-gap chips, incoming units) and the inbound PO list. 140 static pages generated (20 stores × 7 locales).
- **`/sizes`** — product × store × size heatmap. Expected demand-share bar above each column; cells show units per size per store with red for stock-outs, amber for <2w of size cover, green for healthy. Directly answers the JD's "analyze size performance at SKU and store level".

### 3b. Missed sales as first-class

New `getMissedSales()` computes lost-sales opportunities combining full stock-outs (velocity × weeks out) and per-size gaps (velocity × expected size share). Split by reason (`fullStockout` / `sizeGap`). Surfaced as a new **Missed revenue** headline KPI, a dedicated **Missed sales opportunities** dashboard panel (top 8 items with reason badges and specific gap sizes) and a Missed revenue column on the `/stores` list.

### 3c. Demand-led copy

Title and subtitle of the Allocation page changed to **"Demand-led allocation"** with an explicit methodology banner: *"Each recommendation is triggered by a live demand signal (velocity, upcoming campaign, size gap) rather than the pre-season plan."* This mirrors the JD's "shift from forecast-driven to demand-led replenishment" sentence.

---

## Iteration 4 — Deep JD coverage

Iteration 3 covered the JD's explicit bullets. Iteration 4 added the more subtle signals a senior allocator would look for.

### 4a. Stock imbalances (first-class)

The JD mentions "stock imbalances" next to "missed sales opportunities". In v1 these were implicit in the recommender. Now:

- `getStockImbalances()` identifies SKUs with the widest cover spread across selling stores (min vs max), quantifies trapped capital at COGS and a weekly carrying cost (1.5 %/w).
- `getTotalImbalanceCost()` gives a network-level weekly cost number.
- Dashboard shows a compact **Imbalance cost** note and a **Stock imbalances** panel with the 6 highest-priority SKUs as "low-cover store ↔ high-cover store".

### 4b. Risks & opportunities

New `/risks` page consolidating what was previously scattered. Two tabs:

- **Risks**: SKU-locations predicted to stock out within 2 / 4 / 6 weeks (filterable by bucket). Each entry: velocity, weeks-to-stockout, revenue at risk, margin at risk, campaign chip when a campaign is upcoming.
- **Opportunities**: overstock with redistribution potential, tagged Overstock / Slow-moving / Idle capital, sorted by redistributable revenue.
- 4 summary stat cards (risks count, revenue at risk, opportunities count, redistributable revenue) recompute live.

Why this matters for the demo: "Able to identify risks and opportunities early and act accordingly" is a JD bullet. Now there's a page named exactly that.

### 4c. Last-year comparison

`getForecastWithLY()` extends the forecast series with a per-week LY value derived via category-specific YoY growth factors and noise. Forecast chart renders the LY line dashed in slate alongside Actual, Forecast and the confidence band.

`getYoYComparison()` drives a `vs LY` trend pill on the Weekly revenue and Weekly margin dashboard KPIs.

Allocators live and breathe LY comparisons — adding them is a domain-signal I care to send.

### 4d. Category rollup

New `/categories` page with one card per category (Road / Trail / Lifestyle / Training / Hike) showing SKU count, weekly revenue, weekly margin, sell-through, avg cover, stock-outs, missed revenue and an 8-week unit sparkline. This is the rollup an allocator brings to the Merchandise Planner meeting.

### 4e. EMEA-first + region toggle

`getKPIsForRegion()` scopes every dashboard KPI to EMEA, AMER or APAC. A new `DashboardKPIBar` client wrapper renders a region pill (EMEA as default to match the role scope). Clicking a pill re-renders all 8 headline KPIs in place.

---

## Iteration 5 — About page and PDF CV

For hiring managers, one click away from the demo itself needs to be *who built this and how to reach them*. Added `/about`:

- Header with name, role, Zurich address, email, phone, plus a **Download CV** button linking to `public/gemma-garcia-de-la-fuente-cv.pdf`, a LinkedIn quick link and a GitHub quick link.
- "About this demo" disclaimer card.
- Profile paragraph taken verbatim from the CV.
- Experience timeline (UBS, Google, KH Lloreda) with full bullet lists.
- Core skills grouped in three cards as tag pills.
- Education + Languages side-by-side (MSc Financial Management 2024, MSc Data Science 2022, BSc Statistics 2019; CA/ES native, EN/FR fluent, IT intermediate, DE learning).
- **"Beyond work"** — short paragraph on skiing, mountain hiking and walking the newly-adopted pup along the **Limmat**. That last detail is deliberate: On Labs is on the Limmat riverside too, so it doubles as a subtle geographical anchor for a Zurich-based hiring manager. Translated across all 7 locales.

Nav gains a 10th entry (`About`).

---

## Iteration 6 — Decision-led demo: priorities queue, missed-sales post-mortem, info popups

The previous iterations were heavy on analysis — KPIs, charts, lists. A senior allocator doesn't open the tool to *look at numbers*; they open it to *clear a queue*. Reframed the Dashboard around that.

### 6a. "Today's priority decisions" queue

`getTopDecisions()` consolidates four streams — risks, missed-size opportunities, imbalances and overstock — into a single ranked list scored by absolute revenue impact. The new `DecisionsQueue` client renders the top 12 with type badge (Stock-out risk / Campaign uplift / Size gap / Imbalance / Overstock), product, location, financial impact and three primary actions: **Approve**, **Defer**, **Escalate**. Each row also deep-links into the matching page (allocation / risks / sizes). Live tally below the header counts approved / deferred / escalated and shows approved revenue + margin impact.

This sits as the hero section above the KPI grid — when you open the dashboard, the first thing you see is your worklist for the morning.

### 6b. Missed Sales as a Diagnose → Recover → Prevent post-mortem

Replaced the static missed-sales list with `MissedOpportunitiesClient`. Each row is now expandable into a 3-column post-mortem framework:

- **Why it happened** — root cause derived from context: campaign-driven forecast miss, demand spike vs 8-week baseline, replenishment cadence too slow, or size-curve mismatch.
- **Recover now** — concrete recovery action with unit hint and ETA: expedite from regional DC, cross-ship from a sister store with overcover, or pull specific sizes. Includes an **Approve recovery** button.
- **Prevent next time** — process fix tagged with an **owner** (Forecasting / Allocation / Merchandising / Replenishment): tag the campaign for next season, raise safety stock, recalibrate the size curve, tighten cadence. Includes an **Add to fix log** button.

Mini summary at the top: lost-this-cycle, recoverable-now, fixes-logged.

This was driven by a clear product brief: *"missed-sales is super important; show why it happened, how to recover and how to stop it from happening again"*. Allocators run exactly this loop; the panel mirrors it.

### 6c. Info popups on every section

`InfoTooltip` is a small `(i)` icon with a popover that opens on hover/focus/click and dismisses on outside click or Escape. `Card`, `KPICard` and `PageHeader` accept an optional `info` prop and render the tooltip alongside the title.

A localised `info.*` block in all 7 locales covers every headline KPI (stock health, sell-through, stock-outs, revenue, margin, in-transit, MAPE, missed revenue, imbalance cost) and every chart / panel (sales-by-region, stock-by-region, top movers, at-risk, missed opportunities, imbalances, POs, forecast chart, size heatmap, risks tabs, categories, decisions queue, simulator, products, store detail).

Also fixed a translation bug in this iteration: `"dashboard.missedOpportunities"` and `"forecast.ly"` had been written as flat keys with literal dots in the names. next-intl resolves dots as a path lookup, so they fell through to the raw string. Moved them into their nested blocks across all 7 locales.

---

## Iteration 7 — In progress: multi-sector pivot

After the On application closed without success, the demo is being repositioned away from a brand-specific portfolio piece toward a **generic AI-assisted allocation tool that any retail vertical can run on synthetic data**. Same engine, swap the SKU set on the way in.

### Decisions made

- **Sectors v1 = footwear, grocery, bookstore, fashion**. Pharmacy and electronics deferred until the v1 wiring is stable. Each sector ships ~18 SKUs (footwear keeps its 25). Categories per sector are sector-native (`produce / dairy / bakery / …` for grocery; `fiction / nonfiction / children / art / cookbooks` for bookstore; `tops / bottoms / dresses / outerwear / accessories` for fashion).
- **Selection model = cookie + onboarding page**. First visit lands on `/start` with a small two-question form (sector + locale). Selection writes the `as_sector` cookie and redirects to the dashboard. No sticky URL segment — keeps existing routes clean.
- **Server-side resolution via `cache(cookies)`**. Sector is read once per request via React's `cache` and `next/headers` cookies. Each data function caches its output in a `Map<SectorId, T>` keyed by sector, so all sectors stay deterministic and cacheable.
- **Per-product `seasonalProfile`**. The previous seasonality function branched on `category` strings hard-coded for footwear (`hike peaks autumn`, etc.). Replaced with `{ amplitude, phaseShift }` per product so each sector defines its own seasonality without rewriting the engine. Holiday-cookbook surge in Q4 and summer-dress lift in Q2 fall out of this naturally.
- **Brand language scrubbed**. The "On" / "Allocation Studio" branding is being neutralised. Disclaimers, footer links and the `/about` CV page are all coming out — the goal is a sector-agnostic demo any future hiring manager can recognise as their own.

### What's already in `main`

- `src/data/sectors.ts` — full 4-sector dataset with ~80 SKUs total, complete with category strings, gender-specific size curves, COGS, seasonal profiles, region biases and lead times.
- `src/data/products.ts` — refactored to read the `as_sector` cookie via `cache(cookies)`, with new exports `getActiveSectorId()`, `getProducts()`, `getCategories()`, `getProductMap()`. The old synchronous `products` and `productById` are kept as backwards-compat aliases that point at the default footwear sector, so the rest of the data layer keeps building while it's being migrated.

### What still needs to land before this iteration is shippable

- [ ] **Refactor `src/data/series.ts`** (≈1500 lines): every function — `getSales`, `getInventory`, `getInventoryBySize`, `getMarketingSpend`, `getForecast`, `getForecastWithLY`, `getAllocationRecommendations`, `getMissedSales`, `getMissedSalesWithDiagnosis`, `getStockImbalances`, `getRisks`, `getOpportunities`, `getCategorySummaries`, `getStoreSummaries`, `getStoreDetail`, `getProductSizeMatrix`, `getKPIs`, `getKPIsForRegion`, `getTopDecisions`, `getPurchaseOrders`, etc. — needs to become async, key its caches by `SectorId`, and read product data through `await getProducts()` / `await getProductMap()`. Internal helpers (`recentVelocity`, `aggregatedRegionVelocity`, `seasonality`, `campaignLift`) follow the same pattern.
- [ ] **Wire seasonality through the per-product profile** instead of hard-coded category branches. Default profile for SKUs without one explicitly set.
- [ ] **Make campaigns sector-aware**. Universal moments (Black Friday, Boxing Day) stay; the marathon set should only fire for footwear, the holiday-cookbook lift for bookstore, etc.
- [ ] **Update every server page** (dashboard, products, stores, sizes, allocation, risks, forecast, simulator, categories, store detail) to `await` the data functions.
- [ ] **`/start` page**: a small form with sector and locale selectors plus a "Launch demo" button. Submits via a server action that sets `as_sector` and redirects to `/{locale}` with the cookie attached.
- [ ] **Proxy redirect** in `proxy.ts`: if no `as_sector` cookie is set and the URL is not `/start`, redirect to `/start` so first-time visitors always pass through onboarding.
- [ ] **Translations** for every new sector-specific category across all 7 locales (`products.categories.<key>` for grocery, bookstore and fashion categories), and the `/start` UI strings.
- [ ] **Sector switch in the header** for visitors who already onboarded — a small dropdown next to the language switcher to reseed the cookie and reload.
- [ ] **Remove the `/about` page**, the CV PDF download, the Beyond-work photo gallery, the GitHub/LinkedIn footer links and the nav entry. The demo should not carry personal branding now that it's a generic tool.
- [ ] **Brand sweep**: footer disclaimer, `<Metadata>` title and description, README and DEVELOPMENT_LOG should drop the "On AG" references.

### Trade-offs being accepted

- Pages will move from static-per-locale to dynamic-per-request. The cookie read forces dynamic rendering — acceptable on Vercel free tier given the demo's traffic profile.
- Some campaigns won't fire for some sectors (e.g. NYC Marathon does nothing in grocery). Will be addressed by the sector-aware campaign filter, but the v1 rollout will accept the silent no-op rather than block on it.
- Catalan stays out of the locale list — same reasoning as before.

---

## Iteration 8 — Forecasting Lab (Lead Data Scientist · Supply Chain Forecasting)

The role I'm now applying to is **Lead Data Scientist (Supply Chain Forecasting)** at On — a step deeper into the ML stack than the allocator role. The mission is forecast-accuracy + scalable ML pipelines + Time Series Foundation Models + agentic decisioning. The demo had to grow accordingly. The allocation/missed-sales/risks pages stay (they're how forecasts land in the business); two new pages model the forecasting science and the engineering around it.

### 8a. Data layer additions

- `getForecastsByMethod()` — six forecasting methods generated against the same actuals with method-specific MAPE characteristics:
    - **Seasonal Naive** (~18% MAPE, deprecated baseline)
    - **ETS** (~14%)
    - **Prophet** (~11%, current Production legacy)
    - **Chronos** (~9%, Time Series Foundation Model challenger)
    - **TimesFM** (~9%, second TSFM challenger)
    - **Ensemble** (~7.6%, current Champion)
  Each returns 26 weeks of actuals plus 8 forecast weeks with **P10 / P90 quantile bands** and per-horizon MAPE (1w / 4w / 8w / 13w) plus bias.
- `getHierarchicalForecast()` — bottom-up and MinT-reconciled forecasts at network → region → store levels with reconciliation deltas.
- `getModelRegistry()` — every model with version, status (Champion / Challenger / Production / Deprecated), MAPE, gap to the legacy baseline, drift score, last-trained, next-retrain.
- `getPipelineRuns()` — recent training runs with trigger (Scheduled / Drift / Manual / Agentic), duration, models trained, MAPE Δ vs the previous run.
- `getDriftWatchlist()` — series whose recent pattern diverges from training, with pattern type (trend-shift / level-shift / variance-shift / campaign-effect) and a recommended action (retrain / investigate / promote-tsfm).

### 8b. /forecast → Forecasting Lab

The page that used to show one forecast line now shows **the entire model evaluation surface**:

1. Composed chart with the **champion** forecast as the lead line, p10–p90 confidence band shaded, **challenger** TSFMs (Chronos, TimesFM) as dashed lines for visual comparison. Toggle to hide challengers.
2. **Method comparison table**: backtested MAPE per horizon for each model, bias, family badge (Classic / ML / TSFM / Ensemble) and a status pill (Champion ⭐ / Challenger / Production).
3. **Hierarchical reconciliation table**: bottom-up sums against MinT-reconciled values at network / region / top-store levels with Δ% — flags rows above ±3% as needing review.

This directly mirrors the JD's "drive impact on Forecast accuracy" + "multi-level forecasting frameworks" + "Time Series Foundation Models (e.g. Chronos, TimesFM)".

### 8c. New /lab page — model registry, pipelines, drift

The engineering side of the forecast:

- 4 summary tiles at top: **Champion model**, **Active challengers**, **Last training run**, **Drift watchlist size**.
- **Model registry** table: each model with family badge, version (semver), MAPE, Δ-vs-baseline (in percentage points, green when negative), last-trained age, status badge.
- **Pipeline runs** list (last ~10): each run shows id, trigger (Scheduled / Drift / Manual / **Agentic**), duration, # models trained, MAPE Δ. The most recent run is currently `running` and was triggered by an LLM agent ("Agent suggested Chronos retrain at finer granularity").
- **Drift watchlist**: SKU-locations with the highest drift scores, each tagged with the detected pattern and a recommended action — **promote-tsfm** (route to Chronos / TimesFM) when drift > 0.85, **retrain** above 0.7, **investigate** below.

This directly mirrors "Build Scalable Solutions: design and deploy end-to-end ML pipelines autonomously, utilising agentic coding tools" + "Harness New Architectures: pair forecasting algorithms with agentic decision-making tools".

### 8d. Brand sweep

- Tagline updated to *"Multi-level demand forecasting + agentic decisions for retail supply chains"* across all 7 locales — leans into the JD's vocabulary.
- Demo strapline now ends *"… built with Claude Code"* — the JD calls out "agentic coding tools to accelerate prototyping". The fact that this codebase was built with one is a concrete proof point.
- Default sector remains **footwear** with realistic Cloud-style product names so the On-relevance is immediate when opened cold.

### 8e. Translations

7 locales updated end-to-end with the new `forecastLab.*`, `lab.*` and `info.*` blocks (champion/challenger/production status, family badges, drift patterns, run triggers, hierarchical level labels, pipeline run states).

### Trade-offs

- The forecasts are still synthetic — each method has a fixed noise envelope based on its archetypal MAPE rather than running an actual Chronos / TimesFM. The point of the demo is to show I know **what the comparison surface looks like**, not to run inference live; a real role would call HuggingFace endpoints or a hosted TSFM service.
- The /lab page is read-only — no "Retrain now" button is wired up to a backend. The next step there is hooking the agentic auto-experiment trigger into a server action (logged but not implemented in this iteration).

---

## Open follow-ups (post-iteration-8)

- [ ] Wire a live Chronos / TimesFM endpoint behind the Forecast Lab so one of the challenger lines is real inference rather than synthesised.
- [ ] Add a "Promote challenger to champion" action on /lab that actually flips the registry status (server action + cookie or in-memory store).
- [ ] Add a "Retrain now" agentic-action button on each drift item that creates a synthetic run record and prepends it to the pipeline list.
- [ ] Add a small "Forecast vs Actual diagnostic" page that decomposes residuals into bias / variance / outlier components per SKU.
- [ ] Add quantile loss (pinball) as a second metric alongside MAPE so the demo speaks to optimisation-metric design.
- [ ] Add a "Methodology" page explaining how each metric is computed.
- [ ] Add download-CSV button to the Allocation table (export the approved set).
- [ ] Add a Map view for the Locations data using react-simple-maps or D3.
- [ ] Add a screen recording / Loom in the README explaining the demo flow.
- [ ] Add pharmacy + electronics as additional sectors once v1 wiring is stable.

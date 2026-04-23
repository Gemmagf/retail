import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Download,
  Mail,
  MapPin,
  Phone,
  Building2,
  Briefcase,
  GraduationCap,
  Languages as LanguagesIcon,
  Mountain,
  Sparkles,
  Wrench,
  Workflow,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";

type Role = {
  title: string;
  company: string;
  location: string;
  dates: string;
  bullets: string[];
};

const roles: Role[] = [
  {
    title: "Senior Data Scientist & Product Owner",
    company: "UBS Business Solutions AG",
    location: "Zurich, Switzerland",
    dates: "Nov 2022 – Present",
    bullets: [
      "Led vision, development and delivery of a risk data quality product — Product Owner for two critical tools: an anomaly-detection dashboard and a statistical validation engine.",
      "Managed a cross-functional pod of 5 (IT + business) through full agile cycles, reducing project delivery time by 50 %.",
      "Designed and maintained statistical and anomaly-detection models (outlier detection, decision trees) to flag critical data errors across large, multi-source datasets — translating signals into actionable insights for operational teams.",
      "Championed the transition from Tableau to Power BI across the risk function, enhancing performance and usability.",
      "Refactored Python-based detection pipelines to improve scalability and model robustness, and acted as the bridge between technical and commercial teams — simplifying complex outputs into clear recommendations and driving adoption across regional stakeholders. Directly relevant to modern allocation and replenishment engines.",
      "Spearheaded internal marketing initiatives (web, video, training) and mentored and retained an intern over 1.5 years.",
      "Actively using next-generation AI tooling (LLM-powered assistants, Claude Code) to accelerate data-product development.",
    ],
  },
  {
    title: "Business Analyst",
    company: "Google (via Adecco)",
    location: "Zurich, Switzerland",
    dates: "Apr 2022 – Sep 2022",
    bullets: [
      "Built a real-time Google Data Studio dashboard tracking user behaviour, conversion funnels and performance KPIs for a new YouTube feature rollout.",
      "Defined success metrics with the Product Manager and engineering team, ensuring measurement alignment with product goals.",
      "Presented insights to senior stakeholders to guide feature rollout decisions and optimisations.",
    ],
  },
  {
    title: "Data Scientist — Consumer Goods / Retail",
    company: "KH Lloreda (KH-7)",
    location: "Granollers, Spain",
    dates: "Jan 2021 – Apr 2022",
    bullets: [
      "Integrated data from multiple sources — social media, SEO, SEM, TV, Instagram, Facebook, Amazon Marketplace — into a comprehensive dashboard for strategic decision-making.",
      "Built regression-based sales forecasting models linking marketing spend, geography and campaign timing to revenue — foundational demand-forecasting work directly transferable to retail allocation and replenishment.",
      "Analysed sell-through, ROI, ROAS and CPA across channels and regions to identify where stock and investment were converting vs. under-performing, guiding media and distribution decisions.",
      "Implemented channel-effectiveness analyses optimising strategies on Amazon and other online marketplaces; supported marketing mix evaluation by quantifying channel contribution and investment efficiency.",
      "Partnered with commercial leadership to optimise budget distribution across channels using performance-elasticity insights, presenting strategic recommendations that influenced campaign investment and customer-acquisition strategy at leadership level.",
    ],
  },
  {
    title: "Data Analyst",
    company: "Additius Santa Maria",
    location: "Santa Maria de Palautordera, Spain",
    dates: "Jul 2020 – Dec 2020",
    bullets: [
      "Applied machine learning on satellite imagery to detect and classify crops across agricultural plots.",
    ],
  },
];

const skillGroups = [
  {
    title: "Forecasting & retail KPIs",
    icon: Sparkles,
    items: [
      "Regression",
      "Time series",
      "Elasticity",
      "Causal inference",
      "Anomaly detection",
      "Sell-through",
      "Stock cover",
      "Size performance",
      "ROI / ROAS / CPA",
      "Funnel KPIs",
    ],
  },
  {
    title: "Tech stack",
    icon: Wrench,
    items: [
      "Python (pandas, scikit-learn, statsmodels, Streamlit, TensorFlow)",
      "SQL",
      "R",
      "DAX",
      "Power BI",
      "Tableau",
      "Google Data Studio",
      "Excel",
      "Git",
      "Next.js / TypeScript",
      "JavaScript",
      "Claude Code / LLM assistants",
    ],
  },
  {
    title: "Ways of working",
    icon: Workflow,
    items: [
      "Product ownership",
      "Cross-functional stakeholder management",
      "Agile / Scrum",
      "A/B testing",
      "KPI & dashboard design",
      "Training & change adoption",
      "Mentoring",
    ],
  },
];

const education = [
  { title: "MSc Financial Management", school: "Universitat Oberta de Catalunya (UOC)", year: "2022–2024" },
  { title: "MSc Data Science", school: "Universitat Oberta de Catalunya (UOC)", year: "2020–2022" },
  { title: "BSc Statistics", school: "Universitat Politècnica de Catalunya (UPC)", year: "2015–2019" },
  { title: "BSc Psychology", school: "Universitat de Barcelona (UB)", year: "2014–2019" },
];

const languages = [
  { name: "Catalan", level: "Native" },
  { name: "Spanish", level: "Native" },
  { name: "English", level: "C1 · fluent" },
  { name: "French", level: "B2 · fluent" },
  { name: "Italian", level: "B2 · intermediate" },
  { name: "German", level: "B1 · actively learning" },
];

const hobbyPhotos = [
  { src: "/photos/gemma-brienzersee.jpg", alt: "Ridge walk above Brienzersee, Swiss Alps" },
  { src: "/photos/gemma-wildflowers.jpg", alt: "Summer hike in an alpine wildflower meadow" },
  { src: "/photos/gemma-forest.jpg", alt: "Foraging in a pine forest" },
];

export default async function AboutPage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <>
      <PageHeader title={t("about.title")} subtitle={t("about.subtitle")} />

      <div className="mb-6 overflow-hidden rounded-xl border border-border bg-gradient-to-br from-background to-muted/40">
        <div className="flex flex-col md:flex-row">
          <div className="relative md:w-72 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/photos/gemma-matterhorn.jpg"
              alt="Gemma on the slopes, Matterhorn in the background"
              className="h-64 w-full object-cover md:h-full"
            />
          </div>
          <div className="flex-1 p-6">
            <h2 className="text-2xl font-semibold tracking-tight">Gemma Garcia de la Fuente</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Senior Data Scientist · Retail Analytics & Forecasting
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                Zurich 8004, Switzerland
              </span>
              <a
                href="mailto:gemmagdlf@gmail.com"
                className="inline-flex items-center gap-1.5 hover:text-foreground"
              >
                <Mail className="h-3.5 w-3.5" />
                gemmagdlf@gmail.com
              </a>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                +41 76 269 8038
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href="/gemma-garcia-de-la-fuente-cv.pdf"
                download
                className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:bg-foreground/90"
              >
                <Download className="h-3.5 w-3.5" />
                {t("about.downloadCv")}
              </a>
              <a
                href="https://www.linkedin.com/in/gemma-garcia-de-la-fuente-062079109/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
              >
                {t("about.viewLinkedin")}
              </a>
              <a
                href="https://github.com/Gemmagf/retail"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
              >
                {t("about.viewGithub")}
              </a>
            </div>
          </div>
        </div>
      </div>

      <Card className="mb-4">
        <div className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
          <p>{t("about.demoIntro")}</p>
        </div>
      </Card>

      <Card title={t("about.profile")} className="mb-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Senior Data Scientist with 4+ years translating data into commercial decisions across
          retail, marketing and risk. Strong foundation in statistics and forecasting, with hands-on
          experience building demand-led models, monitoring stock and sales performance signals,
          and deploying AI-powered analytical systems into business workflows. Track record of
          leading cross-functional teams through agile processes, mentoring team members and
          facilitating internal adoption of data products. Passionate about marketing science,
          causal inference and robust measurement frameworks that optimise investment decisions —
          comfortable bridging technical and commercial stakeholders.
        </p>
      </Card>

      <div className="mb-4 flex items-center gap-2">
        <Briefcase className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold tracking-tight">{t("about.experience")}</h2>
      </div>
      <div className="mb-6 space-y-3">
        {roles.map((r) => (
          <Card key={r.title + r.company}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold tracking-tight">{r.title}</h3>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <Building2 className="h-3 w-3" />
                  <span>
                    {r.company} · {r.location}
                  </span>
                </div>
              </div>
              <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {r.dates}
              </span>
            </div>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
              {r.bullets.map((b, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold tracking-tight">{t("about.skills")}</h2>
      </div>
      <div className="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-3">
        {skillGroups.map((g) => {
          const Icon = g.icon;
          return (
            <Card key={g.title}>
              <div className="mb-3 flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold tracking-tight">{g.title}</h3>
              </div>
              <ul className="flex flex-wrap gap-1.5">
                {g.items.map((s) => (
                  <li
                    key={s}
                    className="rounded-full border border-border bg-muted/30 px-2.5 py-1 text-xs font-medium"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t("about.education")}
            </h3>
          </div>
          <ul className="space-y-3">
            {education.map((e) => (
              <li key={e.title} className="flex items-start justify-between gap-4 text-sm">
                <div>
                  <div className="font-medium">{e.title}</div>
                  <div className="text-xs text-muted-foreground">{e.school}</div>
                </div>
                <span className="shrink-0 font-medium tabular-nums text-muted-foreground">
                  {e.year}
                </span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <LanguagesIcon className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t("about.languages")}
            </h3>
          </div>
          <ul className="space-y-2">
            {languages.map((l) => (
              <li key={l.name} className="flex items-center justify-between text-sm">
                <span className="font-medium">{l.name}</span>
                <span className="text-xs text-muted-foreground">{l.level}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mb-4">
        <div className="flex items-start gap-3">
          <Mountain className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
          <div className="flex-1">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t("about.hobbies")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("about.hobbiesCopy")}
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {hobbyPhotos.map((p) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={p.src}
                  src={p.src}
                  alt={p.alt}
                  className="aspect-[4/5] w-full rounded-md object-cover"
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}

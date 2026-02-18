# The Talented Mr. Szamowski

Personal website of **Maciej Szamowski** — marketing executive, fullstack developer, and growth consultant. Built from zero to production in a single 8-hour session using **Claude Code** as a pair-programming partner.

**Live:** [szamowski.dev](https://szamowski.dev)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Styling | TailwindCSS v4 (CSS-first config) |
| CMS | Storyblok (Management API) |
| Email | Resend |
| Hosting | Vercel |
| E2E Tests | Playwright (21 tests) |

## The 8-Hour Build Log

What follows is a condensed timeline of how this site went from `npx create-next-app` to a fully deployed, CMS-driven personal brand in one session.

### Phase 1 — Foundation (Hours 1-2)

**Initial scaffolding and Storyblok integration.**

Set up Next.js 16 with TailwindCSS v4, defined the brand palette (`#0ddf72` green, dark mode), and wired up Storyblok as the headless CMS. Hit the first wall immediately: Storyblok's EU-hosted CDN API returns `401` when called from Vercel's US-based edge servers, and the SDK's `region: "eu"` points to a hostname that doesn't resolve.

**The fix:** Bypass the CDN entirely and use the Storyblok Management API (`mapi.storyblok.com`), which works globally. This meant fetching stories individually by ID since the MAPI list endpoint strips the `content` field. Twelve commits just to get reliable data fetching.

### Phase 2 — Design & Hero (Hours 3-4)

**Glassmorphism design system and the hero section.**

Built a full dark-mode glassmorphism design system — frosted glass cards, gradient text, animated background orbs with grain texture and dot matrix overlays. Designed the hero section with a transparent PNG headshot, CSS mask fade, and floating glow rings. Iterated multiple times on the hero photo treatment (z-index battles, mask gradients, scaling).

Added the "About" section with B&W portrait, blockquotes, role badges, and a photo gallery with contextual captions.

### Phase 3 — Content & Features (Hours 4-6)

**Experience timeline, case studies, skills, client logos, blog, and contact form.**

Rapid-fire feature development:
- **Experience timeline** — pulled from `maciek_szamowski_cv.json` with glassmorphic cards
- **Case studies** — dedicated pages with tech stack badges and thumbnails
- **Skills grid** — with react-icons and hover effects
- **Client logos** — monochrome-to-color gradient on hover
- **Blog** — Storyblok-powered with pagination, tags, and share links
- **Contact form** — with Resend integration and WhatsApp link
- **Skeleton loading states** — shimmer animations during CMS data fetch

### Phase 4 — Polish & Easter Eggs (Hours 6-7)

**Terminal effects, Matrix rain, and CRT flicker.**

Added personality: terminal-style typing animations on section headings, a Matrix code rain Easter egg in the navbar, and CRT flicker effects on the contact link. Fixed a hydration error caused by nested `<a>` tags in the navbar logo component.

Implemented GDPR cookie banner with Google Consent Mode v2 and dynamic `sitemap.xml`.

### Phase 5 — Particle Field (Hour 8)

**Canvas-based constellation network behind the hero photo.**

The final touch. Replaced static glow rings behind the headshot with a canvas-based particle system — 35 floating particles connected by luminous lines when in proximity. Brand green, pulsing glow, soft-bouncing off edges. Subtle enough to not distract, dynamic enough to catch the eye.

## Architecture Decisions

- **Management API over CDN** — Storyblok EU spaces don't work from US servers. MAPI is globally accessible and reliable.
- **JSON fallback** — If CMS is unreachable, the site falls back to `maciek_szamowski_cv.json` for critical profile data. The site never breaks.
- **CSS-first Tailwind v4** — Using `@theme` blocks and native CSS instead of `tailwind.config.js`. Cleaner, faster, forward-looking.
- **Native `<img>` for hero** — Next.js `<Image>` doesn't preserve transparent PNG alpha properly with CSS masks. Using native `<img>` with `fetchPriority="high"`.
- **Canvas particles, not DOM** — 35 particles with connections = O(n^2) distance checks per frame. Canvas handles this smoothly; DOM would choke.

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home (hero, about, experience, skills, works, clients)
│   ├── blog/                 # Blog listing + [slug] pages
│   ├── case-studies/         # Case study listing + [slug] pages
│   ├── contact/              # Contact form + social links
│   └── api/                  # Contact form handler + revalidation
├── components/
│   ├── home/                 # Hero, About, Experience, Skills, Works, Clients sections
│   │   └── ParticleField.tsx # Canvas particle constellation
│   ├── ui/                   # Button, Navbar, Footer, CookieBanner
│   └── storyblok/            # CMS bridge components
├── lib/
│   ├── storyblok-fetch.ts    # MAPI primary, CDN fallback
│   ├── storyblok.ts          # SDK init (visual editor only)
│   └── get-profile-data.ts   # Profile data with JSON fallback
└── maciek_szamowski_cv.json  # Fallback CV data
```

## Running Locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run test:e2e   # Playwright tests
```

Required environment variables:
```
STORYBLOK_TOKEN=       # Storyblok personal access token
RESEND_API_KEY=        # Resend API key for contact form
```

## Credits

Built with [Claude Code](https://claude.ai/claude-code) by Anthropic as a real-time pair programmer — from architecture decisions to pixel-level polish.

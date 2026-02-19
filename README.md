# The Talented Mr. Szamowski

> *"The Talented Mr. Ripley"* — bo Maciek Szamowski to człowiek wielu talentów: marketer, fullstack developer, producent muzyczny. Jednym slowem: **Digital One Man Army.**

Personal brand website of **Maciej Szamowski** — marketing executive with 15+ years of experience, fullstack developer, and growth consultant. Built from zero to production across three days (February 17–19, 2026) using **Claude Code** as a pair-programming partner.

**Live:** [szamowski.dev](https://szamowski.dev)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript 5 |
| Styling | TailwindCSS v4 (CSS-first config) |
| CMS | Storyblok (Management API + CDN fallback) |
| Email | Resend |
| Hosting | Vercel |
| Testing | Playwright (21 E2E tests) |
| Analytics | Google Analytics 4 + Consent Mode v2 |
| Font | JetBrains Mono |

---

## The Origin Story

It started with a brief (`CLAUDE.MD`) and a JSON CV. The vision: a dark-mode glassmorphism personal brand site, named after *The Talented Mr. Ripley*, powered by Next.js and Storyblok, mobile-first, with a blog for SEO and a contact form for leads. The color palette — brand green `#0ddf72` on deep black — was locked from the start.

What followed was 46 commits across three days, a brutal fight with Storyblok's EU infrastructure, a design system built from scratch, and a site that went from `npx create-next-app` to production with Easter eggs, canvas particle physics, and GDPR compliance.

This is the full chronicle.

---

## Day 1 — From Nothing to a Living Site (17 February 2026)

**32 commits. ~9 hours. Foundation, CMS integration, design system, all core features.**

### Act I — The Storyblok War (11:15 – 12:37, 12 commits)

The first two hours were supposed to be simple: scaffold Next.js, wire up Storyblok, render content. Instead, they became a debugging marathon.

**The problem:** Storyblok's EU-hosted CDN API returns `401 Unauthorized` when called from Vercel's US-based build servers. The SDK's `region: "eu"` option points to `api-eu.storyblok.com` — a hostname that simply doesn't resolve. The default `api.storyblok.com` redirects for EU spaces, but the SDK doesn't follow `301` redirects.

**The 12-commit journey:**
1. Started with the Storyblok SDK — `401` errors immediately
2. Tried draft version for instant updates — still broken
3. Added cache busting and debug logging — still `401`
4. Removed EU region config — SDK still couldn't follow redirects
5. Replaced the SDK entirely with raw `fetch()` — same redirect issue
6. Made pages `force-dynamic` to skip build-time fetching — partial fix
7. Added a debug endpoint to test the API directly from Vercel
8. Separated fetch logic from SDK to avoid interference
9. Disabled Next.js cache (`no-store`) — still getting stale data
10. Added verbose logging, then a visible debug overlay on the page
11. Switched from slug-based to `content_type` queries — URLs were shifting
12. **The solution:** Bypass the CDN entirely. Use the **Management API** (`mapi.storyblok.com`) which works globally without redirects.

But MAPI had its own quirks: the list endpoint strips the `content` field from stories. So the final architecture fetches story IDs first, then fetches each story individually for full content. Sequential fetching with retry logic to avoid rate limits (`429`).

### Act II — Design System & Hero (12:37 – 14:23, 11 commits)

With data flowing, the design work began.

**Background system** — Three layers stacked:
- SVG `feTurbulence` grain overlay with drift animation
- Three floating gradient orbs with independent motion paths
- Dot matrix pattern (32px grid) with radial fade

The base color shifted from near-black (`#030806`) to dark forest green (`#0a1f15`) and finally settled on deep black (`#050a08`) for maximum contrast.

**Glassmorphism design system** — Frosted glass cards with `backdrop-blur`, green-tinted borders, inset highlights, and hover transforms. Reusable `.glass` CSS class used across every section.

**Hero section** — The most iterated component. Six commits just on the headshot treatment:
- Started with a boxed container, moved to floating figure with glow rings
- Next.js `<Image>` component was stripping PNG alpha on Vercel — switched to native `<img>` with `fetchPriority="high"`
- CSS `mask-image` fade to dissolve the figure into the background
- Z-index battles: glow rings behind the photo, photo above the particle field
- Size iterations: 420x560 → 480x640 → 500x660 → 580x760 on xl screens
- Final fade: solid until `calc(100% - 80px)`, then transparent

**Content sections built:**
- About section with B&W portrait, rich text bio from Storyblok, role badges, photo gallery with captions
- Experience timeline — 8 roles from Monday Agency (2010) to Foap (2025)
- Case studies — dedicated pages with tech stack badges and thumbnails
- Skills grid — 17+ skills with `react-icons` auto-matched to each label
- Client logos — monochrome with brand-green gradient on hover

### Act III — Full CMS Control & Assets (14:13 – 15:27, 4 commits)

Made every piece of text, image, and link editable from Storyblok:
- 8 new CMS fields: social URLs, page descriptions, footer copy
- Navbar name and tagline pulled from CMS
- Footer restructured to use CMS data
- Blog, case studies, and contact page descriptions from CMS
- Removed hardcoded `constants.ts` — everything lives in the CMS now

Added `react-icons` with a tech icon mapping system — every skill and tech stack tag automatically gets its matching icon.

### Act IV — Performance & Loading States (22:35 – 22:37, 2 commits)

A separate optimization branch tackled real performance issues:
- **`React.cache()`** wrapper to deduplicate Storyblok calls (layout + page were firing the same request twice)
- **`Promise.all()` in batches of 5** for MAPI story fetches (replaced sequential `for...of` loop)
- **Parallel fetching** of profile data + blog/case study data on listing pages
- **`unstable_cache`** with 60-second TTL so repeated requests hit the server cache
- **Skeleton loading screens** — shimmer animations shown instantly while async page components fetch data

---

## Day 2 — Personality & Polish (18 February 2026)

**11 commits. Easter eggs, privacy compliance, particle physics.**

### Act V — Terminal Effects & Matrix Easter Egg (10:20 – 10:43, 3 commits)

Merged the performance branch and immediately started adding personality:

**Terminal typing on section headings** — Every `<h2>` on the page uses an `IntersectionObserver` to trigger a character-by-character typing animation when scrolled into view. Shows styled text by default, then "retypes" it with a blinking cursor.

**Matrix navbar Easter egg** — After 15 seconds on any page, the logo fades out and a Matrix-style typing sequence begins:
- *"Vision established..."* → *"Complexity distilled."* → *"Latency eliminated."*
- Dynamic stats line showing hours since project start and lines of code
- CTA with a clickable `/contact` link that has a CRT staccato flicker animation
- Loops every 15 seconds

**Client logos** — Removed borders, increased base brightness to 0.7, brand-green filter on hover.

### Act VI — Branding Details (17:52 – 18:16, 5 commits)

- Selmo wordmark SVG fill changed to white (CSS `mask-image` treats black as transparent)
- Updated Easter egg copy from Matrix-themed to high-velocity brand messaging
- Faster typing speed: 45ms → 30ms per character
- `PROJECT_START` set to Feb 17 for accurate hours calculation
- Custom SVG favicon: terminal-style `$_` cursor in brand green

### Act VII — Privacy, SEO & The Final Touch (19:40 – 20:22, 3 commits)

**GDPR cookie consent** — Full implementation:
- Three consent categories: necessary, analytics, marketing
- Google Consent Mode v2 integration
- Conditional loading of GA4, Meta Pixel, TikTok Pixel, LinkedIn Insight Tag
- Cookie preferences stored in `localStorage` with 365-day expiry
- Banner with accept all / reject all / customize options

**Dynamic sitemap** — Pulls blog posts and case studies from Storyblok, generates `sitemap.xml` with proper `lastmod` dates. Companion `robots.txt` generated at build time.

**Hydration fix** — The navbar logo component had a nested `<a>` inside a Next.js `<Link>` (both render anchor tags), causing a React hydration error. Fixed by replacing the outer `<Link>` with a `<div role="link">`.

**Particle Field** — The capstone of Day 2. Replaced the static glow rings behind the hero headshot with a canvas-based particle constellation:
- 35 floating particles with brand-green glow
- Luminous connection lines drawn between particles within proximity
- Pulsing opacity animation on each particle
- Soft-bouncing off canvas edges
- Device pixel ratio handling for retina displays
- O(n^2) distance checks per frame — canvas handles this at 60fps; DOM would choke

Also cleaned up 37 stray screenshot PNGs from the repo.

---

## Day 3 — Production Hardening (19 February 2026)

**7 commits. 4K displays, mobile fixes, email template, blog paths.**

### Act VIII — 4K & Cross-Device Polish (08:45 – 14:11)

**4K display scaling** — Hero `min-height` capped at `56rem` via CSS `min()` to prevent massive empty space on ultrawide monitors. All sections widened to `max-w-7xl` at `2xl` breakpoint. Hero heading scaled to `text-9xl` on large screens.

**Blog path fix** — Storyblok folder structure used `articles/` internally but the site expected `blog/` paths. Fixed across all pages.

**Branded contact email** — Replaced the plain-text email with a dark-themed HTML template: logo header, green accent borders, structured sender info, mobile-responsive layout.

**Mobile menu fix** — Black triangle corners on the hamburger menu caused by `border-radius` applied to the wrong element. Moved to the `<header>` with `overflow-hidden`.

**Layout polish** — Sticky footer with `flex min-h-screen`, forced visible scrollbar to prevent layout shift, widened content containers across all subpages, inline social links on contact page.

**Skills in About** — Passed the missing `skills` prop to `AboutSection` so skill icons render in the profile area.

**Final CSS pass** — Text size adjustments, skeleton loading tweaks, navbar refinements.

---

## Architecture

### Data Flow

```
Storyblok MAPI (primary)
        ↓ fallback
Storyblok CDN API
        ↓ fallback
maciek_szamowski_cv.json (local)
        ↓
React Server Components (async)
        ↓
ISR cache (60s TTL) + webhook revalidation
```

The site never breaks. If the CMS is down, the JSON fallback keeps everything running.

### Key Decisions

| Decision | Why |
|----------|-----|
| **Management API over CDN** | Storyblok EU spaces don't work from US-based Vercel servers. MAPI is globally accessible. |
| **JSON fallback** | Site must never show an error page. Critical profile data has a local backup. |
| **CSS-first Tailwind v4** | `@theme` blocks in CSS instead of `tailwind.config.js`. Cleaner, faster, forward-looking. |
| **Native `<img>` for hero** | Next.js `<Image>` strips PNG alpha with CSS masks. Native `<img>` preserves transparency. |
| **Canvas particles** | 35 particles with O(n^2) connections per frame. Canvas renders at 60fps; DOM would lag. |
| **Sequential MAPI fetches** | Parallel requests hit Storyblok's rate limit. Batched sequential with retry + backoff. |
| **`React.cache()` dedup** | Layout and page components both need profile data — cache prevents double-fetching. |

### Component Architecture

```
src/
├── app/
│   ├── page.tsx                    # Home — hero, about, experience, skills, case studies, clients
│   ├── layout.tsx                  # Root layout — navbar, footer, background effects, fonts
│   ├── globals.css                 # Tailwind v4 theme, animations, glassmorphism, grain
│   ├── loading.tsx                 # Home skeleton loader
│   ├── robots.ts                   # Dynamic robots.txt
│   ├── sitemap.ts                  # Dynamic sitemap from Storyblok
│   ├── blog/
│   │   ├── page.tsx                # Blog listing — pagination, tags
│   │   ├── loading.tsx             # Blog skeleton
│   │   ├── [slug]/page.tsx         # Blog post — content, share links, related posts
│   │   └── archive/page.tsx        # Monthly archive
│   ├── case-studies/
│   │   ├── page.tsx                # Case study listing
│   │   ├── loading.tsx             # Case studies skeleton
│   │   └── [slug]/page.tsx         # Individual case study
│   ├── contact/page.tsx            # Contact form, WhatsApp, social links
│   └── api/
│       ├── contact/route.ts        # Resend email handler (branded HTML template)
│       └── revalidate/route.ts     # Storyblok webhook → ISR cache invalidation
├── components/
│   ├── home/
│   │   ├── HeroSection.tsx         # Gradient name, tagline, CTAs, headshot with mask fade
│   │   ├── AboutSection.tsx        # Portrait, bio (richtext), roles, gallery, skills
│   │   ├── ExperienceTimeline.tsx  # 8 roles with glassmorphic cards
│   │   ├── SkillsGrid.tsx          # 17+ skills with auto-matched react-icons
│   │   ├── TechProjectsSection.tsx # Case studies with tech stack badges
│   │   ├── ClientsSection.tsx      # Client logos — grayscale to green on hover
│   │   └── ParticleField.tsx       # Canvas constellation (35 particles, proximity links)
│   ├── layout/
│   │   ├── Navbar.tsx              # Fixed header, mobile menu, Matrix Easter egg
│   │   ├── NavbarLogo.tsx          # Terminal typing animation with blinking cursor
│   │   ├── Footer.tsx              # Brand info, navigation, social links (CMS-driven)
│   │   └── BackgroundEffects.tsx   # SVG grain, floating orbs, dot matrix
│   ├── blog/
│   │   ├── BlogCard.tsx            # Post card with image, tags, date
│   │   ├── BlogPostContent.tsx     # Full post with richtext rendering
│   │   └── RelatedPosts.tsx        # Tag-based related posts
│   ├── case-studies/
│   │   └── CaseStudyContent.tsx    # Case study with richtext + tech stack
│   ├── contact/
│   │   ├── ContactForm.tsx         # Validated form → Resend API
│   │   ├── SocialLinks.tsx         # LinkedIn, GitHub, WhatsApp (CMS-driven)
│   │   └── WhatsAppButton.tsx      # Direct WhatsApp link
│   ├── cookie/
│   │   ├── CookieBanner.tsx        # GDPR consent — accept/reject/customize
│   │   ├── CookieSettingsButton.tsx# Re-open consent dialog
│   │   └── TrackingScripts.tsx     # Conditional GA4, Meta, TikTok, LinkedIn pixels
│   ├── effects/
│   │   ├── CursorWarp.tsx          # Cursor warp effect
│   │   └── TerminalReveal.tsx      # Typing animation for section headings
│   └── ui/
│       ├── Button.tsx              # Primary / outline CTA
│       ├── GlassCard.tsx           # Glassmorphic container
│       ├── Pagination.tsx          # Blog pagination
│       ├── ShareLinks.tsx          # Twitter, LinkedIn, copy link
│       └── Tag.tsx                 # Skill/category tag with auto-icon
├── lib/
│   ├── storyblok-fetch.ts          # MAPI primary → CDN fallback, retry logic, caching
│   ├── storyblok.ts                # SDK init (visual editor bridge only)
│   ├── get-profile-data.ts         # Profile loader with JSON fallback
│   ├── cookie-consent.ts           # Cookie preference management
│   ├── tech-icons.tsx              # Icon mapping for all tech/skill labels
│   ├── types.ts                    # TypeScript interfaces
│   └── utils.ts                    # Date formatting, helpers
└── e2e/
    ├── home.spec.ts                # Hero, about, experience, skills tests
    ├── blog.spec.ts                # Blog listing, pagination, post tests
    └── contact.spec.ts             # Contact form validation tests
```

---

## Commit Log Summary

| Day | Date | Commits | Highlights |
|-----|------|---------|------------|
| 1 | Feb 17 | 32 | Storyblok MAPI breakthrough, glassmorphism design system, hero section (6 iterations), all content sections, case studies, blog, contact form, CMS-editable everything, performance optimization branch |
| 2 | Feb 18 | 11 | Performance merge, terminal typing effects, Matrix navbar Easter egg, CRT flicker, branded favicon, GDPR cookie consent, dynamic sitemap, particle constellation canvas |
| 3 | Feb 19 | 7 | 4K display scaling, blog path fixes, branded HTML email template, mobile menu fix, sticky footer, final CSS polish |
| **Total** | | **50** | |

---

## Running Locally

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # Production build
npm run test:e2e     # Playwright (21 tests)
```

### Environment Variables

```
STORYBLOK_TOKEN=              # Storyblok personal access token
STORYBLOK_MANAGEMENT_TOKEN=   # Storyblok management API token
RESEND_API_KEY=               # Resend API key for contact form
CONTACT_EMAIL_TO=             # Destination email for contact form
NEXT_PUBLIC_SITE_URL=         # Site URL (canonical links, email templates)
```

### Storyblok Webhook

Configure a webhook in Storyblok pointing to `https://yourdomain.dev/api/revalidate` on story publish events. This triggers ISR cache invalidation so content updates appear within seconds.

---

## Credits

Built with [Claude Code](https://claude.ai/claude-code) by Anthropic as a real-time pair programmer — from the first `npx create-next-app` through architecture decisions, Storyblok debugging, pixel-level design polish, and every Easter egg in between. 46 of the 50 commits are co-authored by Claude.

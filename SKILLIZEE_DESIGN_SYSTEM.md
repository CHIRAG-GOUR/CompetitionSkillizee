# SkilliZee.io — Design System & Codebase Instructions

> **Purpose:** This document is the single source of truth for any developer or AI model working on this codebase. Read this before touching any file. It covers brand identity, design language, component patterns, file structure, coding conventions, and known gotchas.

---

## 1. Brand Identity

### 1.1 Brand Tagline
> **"Real Skills. Real World. Real Impact."**
> **Core message: Making students "Life Smart", Not Just "Book Smart"**

This tagline and the Life Smart/Book Smart contrast appear everywhere — hero sections, standees, social posts, email copy. Never remove or paraphrase it.

### 1.2 Brand Colors

| Token | Hex | Usage |
|---|---|---|
| **Primary Navy** | `#1d1d4f` | Headings, primary buttons, hero text, badges |
| **Primary Blue** | `#1E63D0` | CTA hover state, accent underlines, links, highlights |
| **Yellow Accent** | `#FFD700` | Underline strokes on key words (SVG path decoration) |
| **Emerald** | `#10b981` / `emerald-500` | Trust/verified icons, WhatsApp button |
| **Slate background** | `#F8FAFC` / `slate-50` | Page backgrounds, card backgrounds |
| **Dark footer** | `#0A0E1A` | Footer background |
| **White** | `#FFFFFF` | Hero bg, card bg, nav bg |

**Gradient accents used across sections:**
```
bg-gradient-to-r from-blue-600 to-indigo-600   ← Section headings
bg-gradient-to-br from-[#1d1d4f] to-[#1E63D0]  ← Dark hero badges
```

### 1.3 Typography

**Font Stack:**
- Primary: System UI / sans-serif (via Tailwind default)
- Display/Headers: `font-black` (weight 900) for all major headings
- Sub-labels: `font-bold` uppercase with wide tracking (`tracking-widest`, `tracking-[0.18em]`)
- Body: `font-medium` text-slate-600

**Type Scale (most used):**
```
Hero H1:     text-4xl md:text-5xl lg:text-[4.5rem] xl:text-[5.5rem]  font-black  tracking-tighter  leading-[1.05]
Section H2:  text-3xl md:text-5xl lg:text-6xl                        font-black  tracking-tight    leading-[1.1]
Card title:  text-lg md:text-xl                                       font-bold
Body:        text-base md:text-lg md:text-xl                          font-medium text-slate-600
Label:       text-[10px] md:text-xs                                   font-bold   uppercase   tracking-widest
```

**Golden Rule:** All major section headings use `font-black`. Never use `font-semibold` for titles.

### 1.4 Accreditations & Trust Badges
Always displayed together. Never show one without the others:
1. **IIT Bombay E-Cell** (logoKey: `iitBombayLogo`, color: `bg-slate-800`)
2. **BITS Hyderabad E-Cell** (logoKey: `bitsHyderabadLogo`, color: `bg-blue-700`)
3. **STEM Accredited** (logoKey: `stemLogo`, color: `bg-emerald-700`)
4. **Top 5% Best in STEM** (logoKey: `bestInStem`, color: `bg-amber-500`)

These are referenced via `getAssetImage(key)` from `src/config/images.js`.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | **React 18 + Vite** |
| Routing | **React Router v6** |
| Styling | **Tailwind CSS v3** (utility-first, no component libraries) |
| Animation | **Framer Motion** (all page animations, card transitions, counters) |
| Icons | **Lucide React** (ONLY — never use emoji as icons in UI) |
| Media | **Firebase Storage** (all images, videos, SVGs) |
| Payments | **Razorpay** |
| State | Local `useState` / `useRef` (no Redux, no Zustand) |

---

## 3. Project File Structure

```
src/
├── App.jsx                          ← Router, global Header/Navbar, mobile menu
├── index.css                        ← Global CSS, Tailwind directives, keyframe animations
├── config/
│   ├── images.js                    ← ALL image/video URLs (Firebase + Cloudinary)
│   └── courses.js                   ← Course pricing constants
├── components/
│   ├── landing_v2/                  ← ★ PRIMARY home page components (USE THESE)
│   │   ├── HeroV2.jsx
│   │   ├── BridgeSection.jsx
│   │   ├── CertificationSection.jsx
│   │   ├── FAQV2.jsx
│   │   ├── FooterCTA.jsx
│   │   ├── GallerySection.jsx
│   │   ├── MentorsV2.jsx
│   │   ├── NarrativeV2.jsx
│   │   ├── ProgramsGridV2.jsx
│   │   ├── SATSection.jsx
│   │   ├── SkillsForSuccessV2.jsx
│   │   ├── TestimonialsV2.jsx
│   │   ├── VideoTestimonialsV2.jsx
│   │   └── VirtualInternshipsV2.jsx
│   ├── landing/                     ← OLD components (do NOT edit unless instructed)
│   ├── common/                      ← Shared components (Footer, Preloader, etc.)
│   └── store/
│       └── StoreCourseCard.jsx      ← Store page course card
├── pages/
│   ├── Store/
│   │   ├── index.jsx                ← Store page layout + filter sidebar
│   │   ├── courseData.js            ← ALL course data (single source of truth)
│   │   ├── StoreCourses.jsx
│   │   ├── StoreInternships.jsx
│   │   ├── StoreSPBLs.jsx
│   │   └── StoreCaseStudies.jsx
│   └── SummerSchool/
│       ├── SummerSchoolPage.jsx
│       └── summerSchoolData.jsx
└── References/                      ← Brand reference images (standees, posts)
    ├── Post 1.png
    ├── Post 7.png
    ├── Post.png
    ├── Standee 6.png
    └── Backdrop.png
```

---

## 4. Design Language & Visual Rules

### 4.1 The Core Aesthetic
**Clean, premium, white-first with deep navy accents.** Think startup-meets-education: approachable but credible.

Looking at the brand references:
- **White backgrounds** dominate — never use dark backgrounds on the main content areas
- **Deep navy (`#1d1d4f`)** for all bold text and primary CTAs
- **Blue (`#1E63D0`)** appears only as an accent/highlight — on hover states, underlines, or key word emphasis
- **Yellow (`#FFD700`)** is used ONLY as a decorative SVG underline stroke beneath key words in headlines. Never as a text color or button color.
- Sections alternate between `bg-white` and `bg-slate-50`

### 4.2 Background Patterns
Use these layered background treatments for depth:

**Grid background (hero-style):**
```jsx
<div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
```

**Ambient blur blobs:**
```jsx
<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#1E63D0]/8 rounded-full blur-[120px]" />
```

**Radial gradient (section bg):**
```jsx
<div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(30,99,208,0.06),transparent)]" />
```

**Decorative floating dots (hero only):**
```jsx
<div className="absolute top-[30%] right-[10%] w-4 h-4 bg-yellow-400 rounded-full opacity-60 animate-bounce" style={{ animationDuration: '3s' }} />
```

### 4.3 Section Badges (Eyebrow Labels)
Every section starts with a small pill badge above the heading:

**Light blue version (most common):**
```jsx
<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-5">
  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
  <span className="text-xs font-bold tracking-[0.18em] text-blue-700 uppercase">The SkilliZee Difference</span>
</div>
```

**White glass version:**
```jsx
<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
  <span className="w-2 h-2 rounded-full bg-blue-600" />
  <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">Label Text</span>
</div>
```

**Dark navy version (hero badge):**
```jsx
<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1d1d4f] text-white shadow-lg">
  <Trophy className="w-4 h-4 text-yellow-400" />
  <span className="text-xs font-bold tracking-[0.15em] uppercase">India's #1 Experiential Learning Platform</span>
  <ShieldCheck className="w-4 h-4 text-emerald-400" />
</div>
```

### 4.4 The Yellow Underline SVG (Signature Brand Element)
**This is the most distinctive brand element.** Key words in headlines get a hand-drawn yellow underline via inline SVG:

```jsx
<span className="relative inline-block">
  <span className="relative z-10 text-[#1E63D0]">"Life Smart"</span>
  <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 260 12" fill="none">
    <path d="M2 10C65 2 195 2 258 10" stroke="#FFD700" strokeWidth="5" strokeLinecap="round" />
  </svg>
</span>
```

Adjust the `viewBox` width proportionally to the word length. Use `strokeWidth="4"` for section H2, `strokeWidth="5"` for hero H1.

### 4.5 Button System

**Primary CTA (navy → blue on hover):**
```jsx
<button className="group relative flex items-center gap-2 bg-[#1d1d4f] hover:bg-[#1E63D0] text-white px-7 py-4 text-base font-black rounded-2xl transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(30,99,208,0.5)] hover:-translate-y-1">
  Explore Programs
  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
</button>
```

**Secondary CTA (white outline):**
```jsx
<a className="group flex items-center gap-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 px-7 py-4 text-base font-bold rounded-2xl transition-all duration-300 hover:shadow-md hover:-translate-y-1">
  Talk to Our Team
</a>
```

**WhatsApp button color:** Always `bg-emerald-500 hover:bg-emerald-600`

**Rules:**
- All buttons use `rounded-2xl` (never `rounded` or `rounded-lg`)
- Primary always `font-black`, secondary `font-bold`
- Hover state always includes slight upward float: `hover:-translate-y-1`
- Primary buttons always have glow shadow on hover

### 4.6 Card Design Rules
- Border radius: `rounded-2xl` or `rounded-[2rem]` (never less than `rounded-xl`)
- Background: `bg-white` with `shadow-sm border border-slate-200`
- Hover: slight elevation `hover:-translate-y-1` or `hover:shadow-md`
- Course card thumbnails: `aspect-[16/9]` or `aspect-[3/2]`, `object-cover`
- Card accent: dynamic top border using course's `color` property
- **No price displayed on any store card** (removed by design decision)
- **No emojis anywhere** — use Lucide React icons instead

---

## 5. Icon System

### 5.1 MANDATORY: Use Lucide React Only
```jsx
import { ArrowRight, Star, BookOpen, Rocket, Lightbulb, BarChart2, Globe, Trophy, ShieldCheck, CheckCircle2, Users, Zap, Building2, Brain, ScrollText, Map, GraduationCap } from 'lucide-react';
```

**Standard icon sizing:**
| Context | Size class |
|---|---|
| Inline with text | `w-4 h-4` |
| Card feature icons | `w-5 h-5` |
| Section/header icons | `w-6 h-6` |
| Hero badge icons | `w-4 h-4` |
| Button icons | `w-5 h-5` |

### 5.2 Brand-Specific SVG Icons (Inline, not Lucide)
The **WhatsApp icon** is always inlined as a raw SVG (Lucide doesn't have it):
```jsx
<svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967..."/>
</svg>
```

### 5.3 What is BANNED
- ❌ Emojis in UI elements (buttons, cards, section headings, filters, labels)
- ❌ Font Awesome or other icon libraries
- ❌ Generic Unicode icons
- ❌ Emoji in `courseData.js` data arrays

---

## 6. Animation System (Framer Motion)

### 6.1 Standard Entrance Animation
Used on virtually every section element:
```jsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={isInView ? { opacity: 1, y: 0 } : {}}
  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
>
```

### 6.2 `useInView` Pattern
Every section uses this pattern for scroll-triggered animations:
```jsx
const sectionRef = useRef(null);
const isInView = useInView(sectionRef, { once: true, margin: '-10% 0px' });

<section ref={sectionRef}>
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={isInView ? { opacity: 1, y: 0 } : {}}
    transition={{ duration: 0.7 }}
  >
```

### 6.3 Stagger Children
```jsx
transition={{ delay: index * 0.1, duration: 0.6 }}
```

### 6.4 Hero Animations (no scroll trigger — fires immediately)
```jsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
```

### 6.5 Hover Micro-interactions
```jsx
whileHover={{ y: -4, scale: 1.02 }}
transition={{ type: 'spring', stiffness: 400, damping: 25 }}
```

---

## 7. Navigation & Header

### 7.1 Header Structure
- Fixed top, `z-50`
- Auto-hides on scroll down, reveals on scroll up
- Glass effect when scrolled: `bg-white/80 backdrop-blur-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.08)]`
- Pill-shaped nav links with spring-animated highlight pill (`layoutId="nav-pill"`)

### 7.2 Mobile Menu — CRITICAL: Use ReactDOM.createPortal
The mobile drawer MUST be rendered via a portal to escape `backdrop-filter` stacking context issues:

```jsx
import ReactDOM from 'react-dom';

// Inside MobileMainMenu component:
{ReactDOM.createPortal(
  <AnimatePresence>
    {open && (
      <>
        <motion.div /* backdrop */ style={{ position: 'fixed', inset: 0, zIndex: 9998 }} />
        <motion.div /* drawer */ style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 9999 }} />
      </>
    )}
  </AnimatePresence>,
  document.body   // ← MUST render to body
)}
```

**Why:** The nav pill uses `backdrop-blur` which creates a new CSS stacking context, causing `position: fixed` children to be clipped on iOS/mobile browsers.

### 7.3 Nav Links (Desktop)
```
Home → /
Summer School → /summer-school
Store → /store
```
Dashboard button → external link to `https://login.skillizee.io/s/authenticate`

---

## 8. Image & Media System

### 8.1 Single Source of Truth: `src/config/images.js`
All image and video URLs live here. **Never hardcode Firebase URLs directly in components** — always add them to `images.js` first and use `getAssetImage(key)` or `getCourseImage(key)`.

```js
import { getAssetImage, getCourseImage } from '../../config/images';
const logoSrc = getAssetImage('skillizeeLogo');
const thumbnail = getCourseImage('saltyInternship');
```

### 8.2 Firebase Storage URL Format
All media is stored in Firebase Storage. URLs follow this pattern:
```
https://firebasestorage.googleapis.com/v0/b/skillizee-io.firebasestorage.app/o/[encoded-path]?alt=media&token=[token]
```

Course thumbnails path: `SkilliZee.io Landing%20Page/Course%20Thumbnail/`
Testimonial videos path: `SkilliZee.io Landing%20Page/Testimonial%20Videos/`

### 8.3 Course Thumbnails (From Firebase)
| Course | URL key |
|---|---|
| Public Speaking | `...Course%20Thumbnail%2FPublic%20Speaking.svg...token=15949d3d-...` |
| MUN 101 | `...Course%20Thumbnail%2FMun%20101.png...token=0d487d16-...` |
| Smart Startup | `...Course%20Thumbnail%2FSmart%20Startup.png...token=6f679ba0-...` |

### 8.4 Video Testimonials (Real Firebase MP4s)
| Video | URL |
|---|---|
| Parent 1 | `...Testimonial%20Videos%2FParent%201.mp4...token=0d42219e-...` |
| Parent 2 | `...Testimonial%20Videos%2FParent%202.mp4...token=d3ddfaf3-...` |
| Student 1 | `...Testimonial%20Videos%2FStudent%201.mp4...token=53024fc7-...` |
| Student 2 | `...Testimonial%20Videos%2FStudent%202.mp4...token=99f8c7a8-...` |

### 8.5 Overflow on Sections with Fixed Backgrounds
> ⚠️ **Known Gotcha:** Do NOT put `overflow-hidden` on the root page wrapper (`<div className="...">` in `App.jsx` or page components). This breaks `position: sticky` in all browsers and breaks `position: fixed` portal rendering on mobile.
>
> Instead, scope `overflow-hidden` to **individual sections** that need it (e.g., the HeroV2 section itself).

---

## 9. Course Data Structure (`src/pages/Store/courseData.js`)

Every course entry follows this schema:
```js
{
  id: 'unique-id',
  title: 'Course Display Name',
  image: 'https://firebasestorage.googleapis.com/...',  // Always Firebase URL
  rating: 4.8,
  studentsEnrolled: 2847,
  showForm: true,           // true = show interest form popup
  link: 'https://...',      // optional - direct enrollment link
  gradeGroup: ['4-6', '7-12'],
  color: '#1E63D0',         // accent color for card top border & CTA button
  // NOTE: 'price' field exists in data but is NEVER displayed in the UI
}
```

**Four categories in `courseData`:**
1. `internships` — Virtual brand internships (Salty, Startup Sprint, Gud Gum, HOCCO)
2. `shortCourses` — LinkedIn Portfolio, Write a Book, Smart Startup, Public Speaking, MUN 101
3. `sbpls` — Skill Based Project Learning
4. `caseStudies` — Harvard-style case studies

---

## 10. Store Page Rules

- **No prices shown anywhere** on the store (removed by design decision in April 2025)
- **No emojis** in category filters, section headers, or card elements
- Section headers use `lucide-react` icons in colored square badges:
  - Internships → `<Rocket />` in `bg-blue-100 text-blue-600`
  - Short Programs → `<BookOpen />` in `bg-indigo-100 text-indigo-600`
  - Skill Based → `<Lightbulb />` in `bg-emerald-100 text-emerald-600`
  - Case Studies → `<BarChart2 />` in `bg-rose-100 text-rose-600`
- Filter sidebar: `sticky top-24` — requires `self-start` on the `<aside>` element
- The filter sidebar's parent must NOT have `overflow-hidden` (breaks sticky)

---

## 11. Summer School Page Rules

- File: `src/pages/SummerSchool/SummerSchoolPage.jsx`
- Data: `src/pages/SummerSchool/summerSchoolData.jsx`
- **Program grid layout:** 3 courses on top row, 2 courses centered on bottom row
- **No "Create Website using Gamma" course** — was removed
- **No emojis** on course cards
- **No icons overlaid** on course card thumbnails (the bottom-left icon overlay was removed)
- "Built for Trust" section — **removed**
- "How It Works" step connector lines — **removed**
- All course card badges appear at **bottom-right of thumbnail**
- Thumbnails use the latest Firebase URLs defined in `summerSchoolData.jsx`

---

## 12. Home Page Section Order

The home page (`src/App.jsx`, rendered as the `/` route) renders these components in order:
1. `HeroV2` — Full viewport hero, white bg, animated
2. `BridgeSection` — "School Marks Tell Everything. No They Don't." comparison
3. `SkillsForSuccessV2` — The 21 skills framework
4. `VirtualInternshipsV2` — Brand internship showcase
5. `SATSection` — Skill Assessment Tool feature
6. `ProgramsGridV2` — All program types grid
7. `CertificationSection` — Certificate display
8. `MentorsV2` — Mentor profiles
9. `GallerySection` — Student work / photo gallery
10. `VideoTestimonialsV2` — Parent & Student video testimonials (2+2)
11. `TestimonialsV2` — Text testimonials
12. `FAQV2` — FAQ accordion
13. `FooterCTA` — Final conversion CTA
14. `Footer` — Site footer

---

## 13. Common Patterns & Conventions

### 13.1 Section Wrapper Template
```jsx
const MySection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10% 0px' });

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32 bg-white overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(...)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section badge */}
        {/* H2 heading */}
        {/* Content */}
      </div>
    </section>
  );
};
```

### 13.2 Max Width
Always `max-w-7xl mx-auto px-4 sm:px-6` for section content.  
Never use `max-w-screen-xl` or `max-w-6xl` unless specifically justified.

### 13.3 Spacing Rhythm
- Section vertical padding: `py-24 md:py-32`
- Between header and content: `mb-14 md:mb-20`
- Between cards: `gap-6` (standard), `gap-8` (spacious)

### 13.4 CSS Quirks & Gotchas

| Problem | Cause | Fix |
|---|---|---|
| `position: sticky` not working | Parent has `overflow: hidden/scroll/auto` | Add `self-start` to sticky element's direct parent; remove overflow from ancestor |
| Mobile nav drawer clipping | `backdrop-filter` on header creates new stacking context | Use `ReactDOM.createPortal(..., document.body)` |
| `position: fixed` modal behind content | `transform` on ancestor | Render via portal to `document.body` |
| Decorative elements bleeding off screen | Missing `overflow-hidden` on section | Add `overflow-hidden` to the specific section, not the page root |
| `AnimatePresence` not animating | Wrapped portal call outside `AnimatePresence` | Move `AnimatePresence` INSIDE the portal |

### 13.5 Commit Message Format
```
feat(ui): short description of visual/feature change

- Bullet point of what changed
- Another bullet point
```

---

## 14. What NOT to Do

1. ❌ **Never use emojis in JSX UI** — they are banned from buttons, cards, headings, filters
2. ❌ **Never add prices to the Store page** — removed by design decision
3. ❌ **Never put `overflow-hidden` on the root page div** — breaks sticky and portals
4. ❌ **Never hardcode image URLs in components** — use `config/images.js`
5. ❌ **Never use TailwindCSS `rounded-md` or smaller on cards** — minimum `rounded-xl`, prefer `rounded-2xl`
6. ❌ **Never use non-Lucide icon libraries**
7. ❌ **Never touch `src/components/landing/` (old V1 components)** unless explicitly told
8. ❌ **Never remove the yellow underline SVG** from hero/section headings — it is a signature brand element
9. ❌ **Never display `price` field on store course cards** — the field exists in data but must not appear in UI
10. ❌ **Never use `font-semibold` for major headings** — always `font-bold` or `font-black`

---

## 15. Design Reference Images (`src/References/`)

| File | What it shows |
|---|---|
| `Post 1.png` | School standee — key layout: logo top-left, headline center, accreditation logos bottom, yellow underline on "LIFE SMART" |
| `Standee 6.png` | Full-length standee with course categories (Internships, SBPLs, Short Courses, Case Studies) and partner logos (Google, IIT-A, ISB, MIT, McKinsey) |
| `Post 7.png` | Student Achiever spotlight card — shows skills-tag pill style (outlined pill with label) |
| `Post.png` | Collaboration announcement post — shows drawing illustration style for community-facing content |
| `Backdrop.png` | Event backdrop reference |

**Key things to extract from reference images:**
- Headlines are always ultra-bold / black weight
- Yellow always appears as underline strokes, never as fill
- Accreditation logos sit together in a horizontal row at the bottom of any section
- The brand uses white space generously — content is never cramped

---

*Last updated: April 2025. Maintained by the SkilliZee product team.*

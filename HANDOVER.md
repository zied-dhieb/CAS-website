# Project Handover & Context Document: IEEE CAS ENET'Com SBC Website

> **Purpose:** This document is prepared for any developer or AI assistant (LLM) continuing work on this repository. It provides the full technical architecture, historical timeline of diagnoses, attempted experiments, applied fixes, and the exact current state of the codebase.

---

## 1. Project Overview & Tech Stack

* **Client/Domain:** IEEE Circuits and Systems Society (CAS), ENET'Com Student Branch Chapter (National School of Electronics and Telecommunications of Sfax, Tunisia).
* **Application Type:** Single Page Application (SPA).
* **Core Technologies:**
  * **Framework:** React 18 (`react`, `react-dom`)
  * **Routing:** React Router v6 (`react-router-dom`)
  * **Build Tool & Dev Server:** Vite 5 (`vite`, `@vitejs/plugin-react`)
  * **Styling:** Tailwind CSS 3 (`tailwindcss`, `postcss`, `autoprefixer`)
  * **3D Graphics:** Three.js r160 (`three`)
  * **Icons:** Lucide React (`lucide-react`)
* **Visual Theme & Identity:** "The Living Circuit" — Cyber-electronic circuit aesthetic with green/emerald neon traces on a dark background, light/dark mode switchable, featuring a 3D WebGL background motherboard and an interactive 2D SVG circuit overlay with simulated voltage probes.

---

## 2. Directory Structure & Key Files

```
cas-enetcom-websiteV.3 - Copy/
├── index.html                   # Main HTML shell (loads fonts, pre-paint theme script, favicon)
├── vite.config.js               # Vite config with relative base path and Rollup vendor chunking
├── package.json                 # Scripts: "dev", "start", "build", "preview"
├── tailwind.config.js           # Design tokens (colors: brand, ink, paper, night; custom fonts)
├── postcss.config.js            # PostCSS plugins (tailwindcss, autoprefixer)
├── public/
│   └── favicon.png              # Chapter icon
└── src/
    ├── main.jsx                 # React root mount with BrowserRouter
    ├── App.jsx                  # App routing, navbar, footer, Scene3D, and CircuitBoard mounting
    ├── assets/
    │   ├── images/              # Event & award imagery (award-2026.png, ieee-day-group.png)
    │   ├── logos/               # cas-logo.png, enetcom-sb-logo.png, enetcom-school-logo.png
    │   └── team/                # Posters for board members (chair, vice-chair, etc.)
    ├── components/
    │   ├── home/                # Home page sections:
    │   │   ├── Hero.jsx         # Hero title, copy, CTA buttons, WebGL check + GlassChip fallback
    │   │   ├── GlassChip.jsx    # Pure SVG animated microchip with pulsing pins & CAS logo die
    │   │   ├── AboutTeaser.jsx  # "Who we are" summary + IEEE Day group photo
    │   │   ├── InNumbers.jsx    # Animated counter stats inside frosted .card box
    │   │   ├── AwardFeature.jsx # Chapter of the Year 2026 poster & text
    │   │   ├── WhatWeDo.jsx     # Focus areas grid (Industry 4.0, Agriculture 4.0, etc.)
    │   │   ├── TeamSection.jsx  # Executive board members with image fallback handling
    │   │   └── JoinCTA.jsx      # Bottom contact CTA banner
    │   ├── layout/
    │   │   ├── Navbar.jsx       # Sticky responsive navbar with dark/light mode toggle
    │   │   ├── Footer.jsx       # Footer with social links, partner logos, and contact info
    │   │   ├── Scene3D.jsx      # WebGL 3D circuit board, data packets, fog, and floating 3D chip
    │   │   └── CircuitBoard.jsx # 2D SVG overlay with vertical trunk, 45° branches, and hover probe
    │   └── ui/
    │       ├── Review.jsx       # Yellow badge marking placeholder data needing verification
    │       └── PhotoSlot.jsx    # Placeholder for pending photography
    ├── data/                    # JSON data stores:
    │   ├── site.json            # Taglines, social links, contact info
    │   ├── activities.json      # Domain focus areas & descriptions
    │   ├── stats.json           # Chapter numeric metrics
    │   └── team.json            # Board members and their roles
    └── styles/
        └── index.css            # Tailwind directives, .card, .frame, .gem, and noise background
```

---

## 3. History of Issues & Solutions

### A. Initial Workspace Diagnosis & Core Fixes
1. **Broken Static / Preview Loading (`vite.config.js`):**
   * *Issue:* Vite defaulted to root paths (`/assets/...`). Opening `dist/index.html` or hosting on subfolders caused asset 404s.
   * *Fix:* Added `base: './'` to [vite.config.js](file:///c:/cas-enetcom-websiteV.3%20-%20Copy/vite.config.js).
   * *Optimization:* Added manual Rollup chunk splitting for `three` and vendor packages to eliminate bundle size warnings.
2. **Missing `start` Command (`package.json`):**
   * *Issue:* Running `npm start` gave `Missing script: "start"`.
   * *Fix:* Added `"start": "vite"` alias to [package.json](file:///c:/cas-enetcom-websiteV.3%20-%20Copy/package.json).
3. **Favicon 404:**
   * *Fix:* Added [public/favicon.png](file:///c:/cas-enetcom-websiteV.3%20-%20Copy/public/favicon.png) and linked it in [index.html](file:///c:/cas-enetcom-websiteV.3%20-%20Copy/index.html).
4. **Desktop Layout Shift & Misalignment (`src/App.jsx`):**
   * *Issue:* `<main>` had `lg:pl-20` (80px padding) while `Navbar` and `Footer` did not. On screens $\ge 1024\text{px}$, page content was pushed 80px to the right, misaligned with the header and footer.
   * *Fix:* Removed `lg:pl-20` from `<main>`. Now Navbar, Main, and Footer align symmetrically.
5. **3D Hero Chip Invisible / Washing Out (`Scene3D.jsx`):**
   * *Issue:* A CSS mask `[mask-image:linear-gradient(to_bottom,transparent,black_30%)]` was applied to the 3D canvas container. Because the Hero is at the top 0%–30% of the screen, the 3D CAS chip and top traces were masked to 100% transparent.
   * *Fix:* Removed the top-clipping CSS mask. The 3D fog (`THREE.FogExp2`) already handles natural distance fading.
6. **3D Chip Route-Awareness & Scroll Collision (`Scene3D.jsx`):**
   * *Issue:* The floating CAS chip model was stationed at `z = 0` on all pages. When scrolling down on the Home page, the camera flew straight through the chip model; on `/about` and `/contact`, the chip hovered over unrelated text.
   * *Fix:* Added `useLocation()` check so the hero chip only exists on `/`, and added smooth scale-down on scroll (`Math.max(0, 1 - sm * 6)`) before the camera passes it.
7. **WebGL Lifecycle & StrictMode Cleanup (`Scene3D.jsx`):**
   * *Fix:* Added full disposal in `useEffect` cleanup (`geometry.dispose()`, `material.dispose()`, `texture.dispose()`, `renderer.dispose()`) to prevent WebGL memory leaks during React 18 StrictMode remounts.
8. **Hero SVG Fallback (`Hero.jsx`):**
   * *Fix:* Added runtime WebGL capability detection. If a user's browser or device lacks WebGL hardware acceleration, [GlassChip.jsx](file:///c:/cas-enetcom-websiteV.3%20-%20Copy/src/components/home/GlassChip.jsx) automatically renders as an SVG fallback so the hero never looks empty.
9. **Circuit Trace Cutting Across Columns (`About.jsx`):**
   * *Issue:* `Vision` and `Mission` were in a 2-column grid. Having `data-node="Mission"` in column 2 caused a neon trace to route directly over column 1's text.
   * *Fix:* Consolidated to `data-node="Vision & Mission"` on the left column.

---

### B. User-Requested Experimentation & Subsequent Revert

1. **The Request:**
   * User noticed:
     - End of neon line looked like an abrupt cut.
     - Neon trace line ran over the award medal image.
     - Background grid made plain text harder to read on certain screens.
     - User proposed: *"behind each paragraphe to creat a box like that one in the last image"* (referencing the frosted glass `.card` from `InNumbers.jsx`).
2. **What Was Attempted:**
   * Enclosed every paragraph across all pages in `.card` boxes.
   * In [src/styles/index.css](file:///c:/cas-enetcom-websiteV.3%20-%20Copy/src/styles/index.css), modified `.card` using Tailwind `@apply` with arbitrary box-shadow: `shadow-[0_24px_50px_-22px_rgba(20, 80, 30, .35)]`.
   * **The Bug:** Tailwind's `@apply` cannot parse commas/spaces in arbitrary values; PostCSS failed with: `The shadow-[0_24px_50px_-22px_rgba(20, class does not exist`, crashing Vite with a 500 error.
   * **The Fix:** Moved `box-shadow` to a standard CSS property declaration on `.card`.
3. **The User's Revert Decision:**
   * User feedback: *"want to get back i didn't like the changes"*.
   * Having every single paragraph wrapped in heavy frosted boxes degraded the open, sleek look of the site.
   * **Action Taken:** Completely removed all `.card` wrappers from paragraphs on Home, About, Activities, Awards, Contact, and ComingSoon, reverting to the original, clean, open layout.
   * Reverted `CircuitBoard.jsx` to its clean single-layer SVG configuration while keeping null-safety guards.

---

## 4. Current State of the Codebase

* **Build Status:** `npm run build` succeeds in ~4s with **0 errors and 0 warnings**.
* **Dev Server Status:** `npm run dev` and `npm start` start cleanly without warnings.
* **Layout & Visuals:**
  * Clean, open typography directly against the subtle 3D motherboard background.
  * Section cards used only where appropriate (In Numbers, What we work on, Executive Board).
  * 3D WebGL background active, smoothly reacting to mouse movement and scrolling.
  * 2D circuit traces route to section headers (`data-node="Name"`).
* **Theme Switching:** Dark mode default with instant light mode toggle in navbar (`localStorage` persisted).

---

## 5. Development & Deployment Guide

### Running Locally
```bash
# Install dependencies
npm install

# Start local Vite dev server
npm run dev
# or
npm start
# -> Access at http://localhost:5173
```

### Production Build & Preview
```bash
# Build production bundle (outputs to dist/)
npm run build

# Preview production build locally
npm run preview
# -> Access at http://localhost:4173
```

---

## 6. Pending Review Items (Content Checks)

Look for `<Review />` tags across the codebase for items that need final chapter verification before public launch:
* Member count (365) and founding date in [src/data/stats.json](file:///c:/cas-enetcom-websiteV.3%20-%20Copy/src/data/stats.json).
* Formal mission text in [src/pages/About.jsx](file:///c:/cas-enetcom-websiteV.3%20-%20Copy/src/pages/About.jsx).
* Official chapter email & postal address in [src/data/site.json](file:///c:/cas-enetcom-websiteV.3%20-%20Copy/src/data/site.json).
* IEEE Day event photo publishing permissions (NEXUS watermark & IEEE RAS logo).


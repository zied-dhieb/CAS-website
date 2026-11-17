# Explainer: how the site is built and why

A guide for learning. Each section says **what** was done, **with what**, and **why**.

## 1. The big picture
The site is a **single-page application (SPA)**: the browser loads one HTML page and JavaScript swaps the content when you click a link, without reloading. It has no server and no database, so it is cheap to host anywhere (Netlify, Vercel, GitHub Pages).

## 2. Technologies
| Tool | What it is | Why we use it |
|---|---|---|
| **JavaScript (JSX)** | The language of the browser. JSX lets us write HTML-like tags inside JavaScript. | It is the only language browsers run natively, and JSX keeps each piece of the page in one file. |
| **React** | A library for building a page out of reusable components (`Navbar`, `Footer`...). | Write a piece once, reuse it everywhere. The page updates automatically when data changes. |
| **Vite** | The tool that runs the dev server and builds the final files. | Very fast startup and instant refresh while you edit. |
| **Tailwind CSS** | Styling with small utility classes in the markup (`px-5`, `text-brand`). | No separate CSS files to hunt through, and colors and spacing come from one config file, so the design stays consistent. |
| **React Router** | Gives each "page" its own address (`/about`, `/team`). | Links, bookmarks and the back button work, even though it is one HTML file. |
| **Lucide** | An icon set. | Light, consistent icons (menu, sun, moon, social). |
| **JSON files** | Plain text data (`src/data/*.json`). | Anyone can edit events, stats or team members without touching React code. |
| **HTML / CSS** | Page structure and styling. | React and Tailwind produce them in the end. We also wrote small CSS parts in `index.css` for things Tailwind alone does not cover. |

## 3. Folder guide
- `tailwind.config.js`: the **design tokens**: colors (`brand`, `ink`, `paper`, `night`) and fonts. Change a color here and the whole site changes.
- `index.html`: the one HTML page. It loads fonts and applies the saved theme before painting (this prevents a white flash in dark mode).
- `src/main.jsx`: starts React and turns on routing.
- `src/App.jsx`: the route table: which address shows which page, plus the navbar and footer that stay on every page.
- `src/pages/`: one file per page.
- `src/components/`: reusable pieces, grouped by where they are used (`layout`, `home`, `ui`).
- `src/data/`: editable content.
- `src/styles/index.css`: global styles and the few shared classes (`btn`, `trace`, `container-page`).
- `src/assets/logos/`: the three logos you sent.

## 4. Decisions and the reasoning

**Colors from the CAS logo only.** The site belongs to CAS, so its identity leads. The branch and school logos appear only where they are named (footer), so they do not compete.

**Dark and light mode.** Tailwind's `dark:` classes switch styles when `<html>` has a `dark` class. A small hook (`useTheme` in `Navbar.jsx`) toggles that class and saves the choice in `localStorage`. The inline script in `index.html` restores it early.

**The signal wave (`SignalWave.jsx`).** An SVG `<path>` is redrawn about 60 times per second with `requestAnimationFrame`. For each point we compute `y` from a sine, square or triangle function, and blend two functions during the morph (`mix`). It is the one animated element on purpose: the page stays calm and the wave is the memorable part. If the visitor's system asks for reduced motion, it draws one still frame instead.

**Counters (`InNumbers.jsx`).** An `IntersectionObserver` waits until the numbers scroll into view, then counts up once. Reason: animation that responds to the visitor feels deliberate, and counting only when visible avoids wasting it above the fold.

**Rows instead of cards in "What we do".** Four equal rounded cards is the most generic web layout. A ruled list reads faster and fits the page's thin "trace" lines.

**The `trace` divider.** A hairline ending in a green dot, like a signal reaching a node. It is the circuit theme in its quietest form.

**Review markers (`Review.jsx`, `PhotoSlot.jsx`).** Content I cannot verify is shown in loud yellow on the real page, so nothing unverified can slip through unnoticed. Search the code for `<Review` to list them all.

**Accessibility.** Icon buttons have `aria-label`s, images have `alt` text, the nav has labels, keyboard focus is visible, and animation respects reduced-motion settings.

**Placeholder routes (`ComingSoon.jsx`).** Every nav link already works, so there are no dead ends while we build the remaining pages.

## 5. How to run it
```
npm install
npm run dev
```
Open the address it prints (usually http://localhost:5173).

## 6. Things worth experimenting with (to learn)
1. Change `brand` in `tailwind.config.js` and watch the site recolor.
2. Edit a number in `src/data/stats.json` and refresh.
3. In `SignalWave.jsx`, change `Math.PI * 6` to `Math.PI * 10` to see more waves.
4. Add a fifth item to `activities.json`.

---

# Update 3: the living circuit (final direction)

The scope hero was dropped: a diagram dropped in the middle of the page was not an identity. The circuit is now the background of the whole site.

**`CircuitBoard.jsx`.** An SVG behind the content (`absolute`, same height as `<main>`). Any heading with `data-node="Label"` becomes a connection point: the component measures its position with `getBoundingClientRect()`, draws a branch from the trunk (a 45-degree bend then a straight run, as on real PCBs) and ends it in a pad. To add a branch to a new section, just put `data-node="Name"` on its heading.

**Current as you scroll.** The same shapes are drawn twice: dim, and bright with a glow. The bright copy is cut by a `clipPath` rectangle whose height follows the scroll position, so the light seems to travel down the trunk and into each branch.

**Probe.** Hovering a branch or pad lights it and shows a readout (`U3 · Board · 3.3 V`; 0.0 V if the current has not reached it). Hit areas are wide invisible strokes (`pointer-events: stroke`) so thin lines are easy to hover.

**Keeping it correct.** A `ResizeObserver` re-measures when images load or the route changes. The SVG is hidden below 1024px, where there is no room for the trunk.

**Background and frames.** Dotted grid and a corner glow are plain CSS gradients on `body` (`index.css`). `.frame` uses the asymmetric corner radius of the CAS logo's green band.

---

# Update 4: depth

**Background (`index.css`).** Two stacked CSS backgrounds: a grain image and a diagonal `linear-gradient`. The grain is an SVG filter (`feTurbulence`, fractal noise) turned into a tiny repeating image through a data URI, so no file is needed. `background-attachment: fixed` keeps the wash still while content scrolls, which creates a sense of layers.

**Glass chip (`GlassChip.jsx`).** Pure SVG: gradients (`linearGradient`) give the glass body and the white sheen, 8 pins per side are generated with `Array.from`, and the logo is clipped to a circle with `clipPath`. Pins pulse with one CSS keyframe and a delay per pin (`animation-delay`). The pulse is disabled for visitors who prefer reduced motion.

**Glass tubes and parts (`CircuitBoard.jsx`).** A tube is the same path drawn several times: a wide soft stroke, a thin pale highlight on top, and, inside the scroll-clipped group, a glowing green copy. Components rotate through resistor, capacitor and LED (`i % 3`), each drawn with a glass gradient that switches to a bright one when powered.

**Cards.** `.card` (white, asymmetric corners, soft long shadow; frosted in dark mode) and `.gem` (a gradient square with an inner highlight, giving the icon a 3D feel).

---

# Update 5: the 3D background (`Scene3D.jsx`)

**Three.js** is a JavaScript library over WebGL, the browser's GPU API. A scene needs a camera, lights, objects (meshes = geometry + material) and a renderer that draws them every frame.

**Where depth comes from.** (1) Real perspective: parallel lines converge, so the grid sells distance. (2) `FogExp2`: the farther an object, the more it blends into the fog color. (3) Parallax: the camera moves, so near and far things shift at different speeds. (4) A point light that travels with the camera, so nearby parts are brighter.

**Scroll flight.** Scroll progress (0 to 1) moves the camera along z; it eases toward the target (`sm += (target - sm) * 0.06`) so it never jerks. The pointer shifts the camera a little (`cx`, `cy`).

**Traces and packets.** Each trace is a `CatmullRomCurve3` through a few points, turned into a tube with `TubeGeometry`. A packet is a small sphere whose position is `curve.getPointAt(t)` with `t` growing over time. A seeded random generator (`rng`) makes the layout identical on every visit.

**Hovering chips and pulses.** Each chip bobs with `Math.sin(time + phase)`; the shared die material pulses its `emissiveIntensity`.

**Theme.** `apply()` swaps colors in both palettes; a `MutationObserver` watches the `dark` class on `<html>` so the toggle updates the scene instantly.

**Care for visitors.** Pixel ratio capped at 1.5, fewer traces on phones, animation paused in hidden tabs, one still frame with reduced motion, and a try/catch so the site works without WebGL. The CSS mask fades the far edge of the board.

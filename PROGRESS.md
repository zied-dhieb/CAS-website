# Progress

Last updated: 12 Nov 2026

## Decisions
- English only. Colors from the CAS logo only; ENET'Com logos only where those names appear.
- Stack: React + Vite + Tailwind + React Router. Content in `src/data/*.json`.
- **Identity: the living circuit** (scope idea dropped). Dark by default, light mode with toggle.
- Pages: Home, About us, Activities, Awards, Contact us. The board is on Home.
- Yellow tags (`<Review />`, `<PhotoSlot />`) mark anything unverified or missing.
- Hosting and domain: undecided.

## Done
- [x] Setup, tokens, fonts, dark/light, navbar, footer
- [x] Circuit background: trunk, 45-degree branches, pads, scroll-lit current, hover probe with voltage readout, dotted grid and glow
- [x] Home: hero with CAS logo, who we are, numbers, Chapter of the Year, what we work on, **board**, join
- [x] About us (vision draft from banner, mission missing), Activities, Awards, Contact us
- [x] PROGRESS.md, EXPLAINER.md

## Not done yet
- [ ] **Review point:** run it and tell me what to change
- [ ] Logo-curve shapes on the trace bends (frames use the curve now; the traces use 45-degree bends)
- [ ] Hero and section details: richer components on the pads, animation polish
- [ ] Past events list and gallery on Activities; contact form (needs an email service)
- [ ] Mobile and reduced-motion polish, SEO, deployment notes

## Needs verification
- Member count (365) and date; About text (paraphrased); vision (read from banner); mission (missing)
- Event photo: NEXUS watermark and IEEE RAS logo permission
- Activity descriptions (drafts); contact email and address; board completeness

## Known limits
- Not run or tested: no internet here to install packages. Send me any error from the first run.
- The circuit is hidden below 1024px wide (tablet and phone show only the dotted background).

## Update: depth pass (13 Nov 2026)
- [x] Gradient wash (pale/night to deep green) with fine grain, fixed behind the page
- [x] Glass microchip in the hero (SVG, CAS logo as the die, pulsing pins), cropped by the page edge
- [x] Trunk and branches are now glowing glass tubes; pads are glass components (resistor, capacitor, LED) that light up
- [x] Floating cards with glossy icon badges (What we work on, numbers)
- [ ] Still to judge on a real screen: grain strength, light-mode contrast on the green side, chip size on small laptops

## Update: 3D background (13 Nov 2026)
Inspired by your motherboard showcase (fog for depth, raised traces with data packets, hovering chips, colored lights).
- [x] `Scene3D.jsx`: full-page WebGL background. Board and grid recede into fog, 34 raised traces (16 on phones) with data packets, hovering chips with pulsing dies
- [x] Camera flies along the board as you scroll and leans with the pointer
- [x] Floating CAS hero chip (logo on its top face) replaces the SVG chip
- [x] Light and dark palettes; switches live with the toggle
- [x] Falls back to the CSS background if WebGL is missing; frozen frame with reduced motion; pauses in hidden tabs
- [x] Judge on a real screen: speed on your laptop, fog density, hero chip position
- [x] Fixed 3D canvas masking (removed top gradient mask that hid the hero chip)
- [x] Cleaned WebGL lifecycle and resource disposal for React 18 StrictMode
- [x] Route-aware 3D scene (hero chip appears only on Home, gracefully transitions on scroll)
- [x] Fixed layout alignment: removed asymmetric padding that displaced page content from Navbar & Footer
- [x] Fixed CircuitBoard branch lines in About page and enabled interactive hover probe
- [x] Added relative base path `./` and vendor chunk splitting in Vite config
- [x] Added `start` script alias in package.json and favicon in index.html

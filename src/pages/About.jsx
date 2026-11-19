import { Link } from 'react-router-dom'
import { GraduationCap, Briefcase, HeartHandshake } from 'lucide-react'
import aboutData from '../data/about.json'
import casLogo from '../assets/logos/cas-logo.png'

const pillarIcons = [GraduationCap, Briefcase, HeartHandshake]

export default function About() {
  return (
    <>
      {/* 1. Our Identity */}
      <section className="container-page pt-16">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 data-node="About us" className="text-4xl font-bold sm:text-5xl font-display">
            About us
          </h1>
          <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-brand/15 text-brand dark:bg-brand/20 dark:text-brand-light border border-brand/30">
            Est. 2022
          </span>
        </div>
        <div data-glow className="glass-panel mt-6 max-w-3xl p-6 sm:p-8">
          <p className="text-lg sm:text-xl opacity-90 leading-relaxed font-body">
            {aboutData.identity.p1}
          </p>
        </div>
        <blockquote data-glow className="glass-panel--quote mt-8 max-w-3xl p-6 sm:p-8 relative">
          <span className="block text-4xl sm:text-5xl font-display text-brand-light select-none mb-1 leading-none">
            “
          </span>
          <p className="text-xl sm:text-2xl font-display font-medium text-ink dark:text-paper leading-snug">
            {aboutData.identity.quote}
          </p>
        </blockquote>
      </section>

      {/* 2. What We Do */}
      <section className="container-page mt-24">
        <h2 data-node="What We Do" className="text-3xl sm:text-4xl font-bold font-display">
          {aboutData.whatWeDo.title}
        </h2>
        <p className="mt-4 text-lg opacity-90 leading-relaxed max-w-2xl font-body">
          {aboutData.whatWeDo.intro}
        </p>

        {/* Horizontal trace running behind/above the cards with lighting dots */}
        <div className="hidden lg:block relative mt-12 mb-6">
          <div className="absolute top-1/2 left-16 right-16 h-px bg-brand/25 dark:bg-brand/35 -translate-y-1/2" />
          <div className="grid grid-cols-3 relative z-10">
            {aboutData.whatWeDo.pillars.map((_, i) => (
              <div key={i} className="flex justify-center">
                <div
                  data-glow
                  className="w-3.5 h-3.5 rounded-full border-2 bg-paper dark:bg-night border-ink/30 dark:border-paper/40"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 3 Pillar Cards */}
        <div className="grid gap-8 lg:grid-cols-3 mt-6 lg:mt-0">
          {aboutData.whatWeDo.pillars.map((pillar, i) => {
            const Icon = pillarIcons[i]
            return (
              <div
                key={pillar.n}
                data-glow
                className="card flex flex-col items-start"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="gem">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-sm font-semibold tracking-wider text-brand dark:text-brand-light opacity-80">
                    {pillar.n}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-bold font-display text-ink dark:text-paper">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-base opacity-90 leading-relaxed font-body">
                  {pillar.text}
                </p>
              </div>
            )
          })}
        </div>

        {/* Centered bridging outro */}
        <p className="mt-12 text-center text-lg opacity-90 leading-relaxed max-w-2xl mx-auto italic font-body">
          {aboutData.whatWeDo.outro}
        </p>
      </section>

      {/* 3. Our Vision */}
      <section className="container-page mt-24 mb-20">
        <h2 data-node="Our Vision" className="text-3xl sm:text-4xl font-bold font-display">
          {aboutData.vision.title}
        </h2>
        <div data-glow className="glass-panel mt-6 max-w-2xl p-6 sm:p-8 space-y-4 font-body">
          <p className="text-lg opacity-90 leading-relaxed">
            {aboutData.vision.p1}
          </p>
          <p className="text-lg opacity-90 leading-relaxed">
            {aboutData.vision.p2}
          </p>
        </div>

        {/* 4 Keywords Signal Path */}
        <div className="mt-12 py-6">
          {/* Desktop horizontal signal path */}
          <div className="hidden sm:block relative max-w-3xl">
            <div className="absolute top-3 left-[12%] right-[12%] h-0.5 bg-brand/30 dark:bg-brand/40" />
            <div className="grid grid-cols-4 relative z-10 text-center">
              {aboutData.vision.keywords.map(word => (
                <div key={word} className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full border-2 border-brand-light bg-brand dark:bg-brand-dark flex items-center justify-center shadow-[0_0_12px_#8AD82A]">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  </div>
                  <span className="mt-3 font-display font-bold text-base sm:text-lg text-ink dark:text-paper tracking-wide">
                    {word}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile vertical signal path */}
          <div className="sm:hidden relative pl-6 border-l-2 border-brand/40 space-y-6 my-6 ml-2">
            {aboutData.vision.keywords.map(word => (
              <div key={word} className="relative flex items-center gap-4">
                <div className="absolute -left-[31px] w-5 h-5 rounded-full border-2 border-brand-light bg-brand dark:bg-brand-dark flex items-center justify-center shadow-[0_0_8px_#8AD82A]">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
                <span className="font-display font-bold text-lg text-ink dark:text-paper">
                  {word}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Full-width Closing Banner */}
        <div className="mt-16 flex flex-col items-center gap-10 lg:flex-row lg:gap-16">
          <div data-glow className="card relative order-2 w-full p-8 sm:p-10 lg:order-1 lg:flex-1">
            <p className="font-display text-xl font-semibold leading-relaxed sm:text-2xl md:text-3xl">
              {aboutData.vision.closing}
            </p>
            <div className="mt-8">
              <Link to="/contact" className="btn btn-primary">Contact the chapter</Link>
            </div>
            <span className="closing-trace" aria-hidden="true" />
          </div>
          <div className="order-1 shrink-0 lg:order-2">
            <img
              src={casLogo}
              alt="IEEE Circuits and Systems Society logo"
              className="h-32 w-32 rounded-full object-cover sm:h-40 sm:w-40 lg:h-52 lg:w-52"
              style={{ filter: 'drop-shadow(0 14px 22px rgba(0,0,0,0.35))' }}
            />
          </div>
        </div>
      </section>
    </>
  )
}

import { Link } from 'react-router-dom'
import medalSvg from '../../assets/awards/medal.svg'
import awardsData from '../../data/awards.json'

export default function AwardsShowcase() {
  return (
    <section className="container-page mt-24">
      <div>
        <h2 data-node="Awards" className="text-3xl font-bold">
          Our awards
        </h2>
        <p className="mt-2 text-base opacity-80">
          Recognition for the work we do together.
        </p>
      </div>

      <div className="mt-24 grid grid-cols-1 items-stretch gap-x-6 gap-y-24 md:grid-cols-3 md:gap-x-8 md:gap-y-8">
        {awardsData.items.map((award, index) => (
          <div key={award.id} className="award-float h-full" style={{ animationDelay: `${index * -2}s` }}>
            <Link
              to={`/awards#${award.id}`}
              data-glow
              className="card award-card group relative flex h-full flex-col items-center px-5 pb-5 pt-[4.75rem] text-center md:pt-[5.25rem]"
            >
              <img
                src={medalSvg}
                alt=""
                className="award-medal-img pointer-events-none absolute left-1/2 top-0 z-10 h-auto w-28 -translate-x-1/2 -translate-y-1/2 object-contain md:w-32"
              />
              <span className="font-display text-sm font-bold uppercase tracking-widest text-brand dark:text-brand-light">{award.year}</span>
              <h3 className="mt-2 min-h-[3.25rem] max-w-[16rem] font-display text-lg font-bold leading-snug text-ink dark:text-paper">{award.short}</h3>
              <span className="mt-auto pt-3 text-xs opacity-70 transition-colors group-hover:text-brand group-hover:opacity-100 dark:group-hover:text-brand-light">View award →</span>
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}

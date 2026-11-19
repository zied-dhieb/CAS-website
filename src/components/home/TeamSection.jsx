import team from '../../data/team.json'
import Review from '../ui/Review.jsx'

// Vite collects every poster in assets/team so we can look each one up by file name.
const posters = import.meta.glob('../../assets/team/*.png', { eager: true, import: 'default' })

export default function TeamSection() {
  return (
    <section className="container-page mt-28">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 data-node="Board" className="text-3xl sm:text-4xl font-bold font-display">
            The {team.year} board
          </h2>
          <p className="mt-2 text-base opacity-80 max-w-xl">
            Meet the executive team driving the chapter forward, organizing workshops, and building community.
          </p>
        </div>
        {team.review && <Review note="Posters from the chapter's announcements. Confirm the board is complete." />}
      </div>

      <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-7">
        {team.members.map((m) => {
          const src = posters[`../../assets/team/${m.image}.png`]
          return (
            <li key={m.name} className="flex">
              <div data-glow className="board-card card group flex flex-col w-full h-full p-4 sm:p-5">
                <div className="overflow-hidden rounded-bl-[1.5rem] rounded-tr-[1.5rem] border border-brand/25 bg-black/20 aspect-[3/4] flex items-center justify-center">
                  {src ? (
                    <img
                      src={src}
                      alt={`${m.name}, ${m.role} ${team.year}`}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="p-4 text-center">
                      <span className="font-display font-bold text-lg text-ink dark:text-paper">{m.name}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex flex-col items-center text-center px-1 flex-grow justify-end">
                  <h3 className="font-display text-base sm:text-lg font-bold tracking-tight text-ink dark:text-paper group-hover:text-brand dark:group-hover:text-brand-light transition-colors">
                    {m.name}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm font-semibold uppercase tracking-wider text-brand dark:text-brand-light opacity-90">
                    {m.role}
                  </p>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

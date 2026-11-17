import team from '../../data/team.json'
import Review from '../ui/Review.jsx'

// Vite collects every poster in assets/team so we can look each one up by file name.
const posters = import.meta.glob('../../assets/team/*.png', { eager: true, import: 'default' })

export default function TeamSection() {
  return (
    <section className="container-page mt-24">
      <h2 data-node="Board" className="text-3xl font-bold">The {team.year} board <Review note="Posters from the chapter's announcements. Confirm the board is complete." /></h2>
      <ul className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5">
        {team.members.map((m) => {
          const src = posters[`../../assets/team/${m.image}.png`]
          return (
            <li key={m.name}>
              {src ? (
                <img src={src} alt={`${m.name}, ${m.role} ${team.year}`} className="frame w-full" loading="lazy" />
              ) : (
                <div className="frame flex aspect-[3/4] flex-col items-center justify-center p-4 text-center">
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-sm opacity-80">{m.role}</p>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

import { Link } from 'react-router-dom'
import aboutData from '../../data/about.json'
import FamilyWall from './FamilyWall.jsx'

export default function AboutTeaser() {
  return (
    <section className="container-page mt-24 grid items-center gap-10 md:grid-cols-2">
      <div>
        <h2 data-node="Who we are" className="text-3xl sm:text-4xl font-bold font-display">
          Who we are
        </h2>
        <div data-glow className="glass-panel mt-6 p-6 sm:p-8">
          <p className="text-lg opacity-90 leading-relaxed font-body">
            {aboutData.identity.p1}
          </p>
          <div className="mt-6">
            <Link to="/about" className="btn btn-ghost">
              Read our story
            </Link>
          </div>
        </div>
      </div>
      <div>
        <FamilyWall />
      </div>
    </section>
  )
}

import { Link } from 'react-router-dom'

export default function JoinCTA() {
  return (
    <section className="container-page mt-24">
      <div data-node="Join" data-glow className="card max-w-2xl p-6 sm:p-8">
        <h2 className="max-w-xl text-2xl font-bold font-display sm:text-3xl">
          Want to build circuits and systems with us?
        </h2>
        <p className="mt-3 max-w-xl text-base opacity-85 leading-relaxed sm:text-lg">
          Tell us what you are curious about and we will tell you how to get involved.
        </p>
        <div className="mt-6">
          <Link to="/contact" className="btn btn-primary">
            Contact the chapter
          </Link>
        </div>
      </div>
    </section>
  )
}

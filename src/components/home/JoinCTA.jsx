import { Link } from 'react-router-dom'

export default function JoinCTA() {
  return (
    <section className="container-page mt-24">
      <div className="rounded-lg bg-brand-dark p-8 text-white sm:p-12">
        <h2 data-node="Join" className="max-w-xl text-3xl font-bold">Want to build circuits and systems with us?</h2>
        <p className="mt-3 max-w-xl opacity-90">Tell us what you are curious about and we will tell you how to get involved.</p>
        <Link to="/contact" className="btn mt-6 bg-white text-brand-dark hover:bg-paper">Contact the chapter</Link>
      </div>
    </section>
  )
}

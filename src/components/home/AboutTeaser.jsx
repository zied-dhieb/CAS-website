import { Link } from 'react-router-dom'
import Review from '../ui/Review.jsx'
import group from '../../assets/images/ieee-day-group.png'

export default function AboutTeaser() {
  return (
    <section className="container-page mt-24 grid items-center gap-10 md:grid-cols-2">
      <div>
        <h2 data-node="Who we are" className="text-3xl font-bold">Who we are</h2>
        <div className="card mt-4">
          <p className="opacity-90 leading-relaxed">
            We are the newest student branch chapter at ENET'Com, formed on July 27, 2022, with 365 student members so far. The IEEE Circuits and Systems Society promotes the theory, design, tools and implementation of circuits and systems, from industry to agriculture, medicine and biology. We have worked on Industry 4.0 and Agriculture 4.0. <Review note="Paraphrased from the text you sent. Confirm the member count and its date." />
          </p>
        </div>
        <Link to="/about" className="btn btn-ghost mt-6">Read our story</Link>
      </div>
      <figure className="frame">
        <img src={group} alt="The chapter's members and guests gathered in a lecture hall during IEEE Day" className="w-full" loading="lazy" />
        <figcaption className="p-3 text-sm opacity-80">IEEE Day with the chapter. <Review note="The photo carries a NEXUS watermark and an IEEE RAS logo. Confirm we may publish it." /></figcaption>
      </figure>
    </section>
  )
}

import WhatWeDo from '../components/home/WhatWeDo.jsx'
import Review from '../components/ui/Review.jsx'

export default function Activities() {
  return (
    <>
      <section className="container-page pt-16">
        <h1 data-node="Activities" className="text-4xl font-bold sm:text-5xl">Activities</h1>
        <div className="card mt-6 max-w-2xl">
          <p className="text-lg opacity-90 leading-relaxed">Workshops, trainings, visits and projects around circuits and systems.</p>
        </div>
      </section>
      <WhatWeDo />
      <section className="container-page mt-20">
        <h2 data-node="Past events" className="text-3xl font-bold">Past events</h2>
        <div className="card mt-4 max-w-xl">
          <p className="opacity-90 leading-relaxed"><Review>List of past events, dates and photos needed</Review></p>
        </div>
      </section>
    </>
  )
}

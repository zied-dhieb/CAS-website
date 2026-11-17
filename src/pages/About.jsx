import Review from '../components/ui/Review.jsx'

export default function About() {
  return (
    <>
      <section className="container-page pt-16">
        <h1 data-node="About us" className="text-4xl font-bold sm:text-5xl">About us</h1>
        <p className="mt-6 max-w-2xl text-lg opacity-85">
          IEEE ENET'Com Circuits and Systems Society Student Branch Chapter is our newest student branch chapter, formed on July 27, 2022, with 365 student members so far. <Review note="Confirm the member count and its date." />
        </p>
        <p className="mt-4 max-w-2xl opacity-85">
          The IEEE Circuits and Systems Society is the leading organization advancing the theory, analysis, design, tools and implementation of circuits and systems. It reaches industry, agriculture, medicine and biology. In our chapter we have worked on Industry 4.0 and Agriculture 4.0.
        </p>
      </section>
      <section className="container-page mt-20 grid gap-12 md:grid-cols-2">
        <div>
          <h2 data-node="Vision & Mission" className="text-3xl font-bold">Vision</h2>
          <p className="mt-4 opacity-85">Build a vibrant and inclusive community at ENET'Com, help students connect and share knowledge, and inspire future engineers to advance circuits. <Review note="Read from the chapter banner photo. Replace with the official wording." /></p>
        </div>
        <div>
          <h2 className="text-3xl font-bold">Mission</h2>
          <p className="mt-4 opacity-85"><Review>Mission text needed</Review></p>
        </div>
      </section>
    </>
  )
}

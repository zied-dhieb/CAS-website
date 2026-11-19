import award from '../../assets/images/award-2026.png'

export default function AwardFeature() {
  return (
    <section className="container-page mt-24 grid items-center gap-10 md:grid-cols-[320px_1fr]">
      <img src={award} alt="Poster: Student Branch Chapter of the Year 2026, Region 8" className="frame w-full" loading="lazy" />
      <div>
        <h2 data-node="Award" className="text-3xl font-bold">Chapter of the Year 2026, Region 8</h2>
        <div data-glow className="card mt-4 max-w-xl">
          <p className="opacity-90 leading-relaxed">
            Our chapter was recognized as Student Branch Chapter of the Year for IEEE Region 8, for the dedication, teamwork and impact built together over the year.
          </p>
        </div>
      </div>
    </section>
  )
}

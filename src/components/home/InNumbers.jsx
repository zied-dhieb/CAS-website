import { useEffect, useRef, useState } from 'react'
import stats from '../../data/stats.json'
import Review from '../ui/Review.jsx'

function Count({ to }) {
  const ref = useRef(null)
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!ref.current) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      if (reduce || to === 0) return setN(to)
      const t0 = performance.now()
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / 1200)
        setN(Math.round(to * p))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [to])
  return <span ref={ref}>{n}</span>
}

export default function InNumbers() {
  return (
    <section className="container-page mt-24">
      <h2 data-node="Numbers" className="mt-8 text-3xl font-bold">The chapter in numbers {stats.review && <Review note="Placeholder values (0). Replace in src/data/stats.json." />}</h2>
      <dl data-glow className="card mt-8 grid grid-cols-2 gap-x-6 gap-y-8 p-8 md:grid-cols-3">
        {stats.items.map((s) => (
          <div key={s.label}>
            <dd className="font-display text-5xl font-bold text-brand dark:text-brand-light"><Count to={s.value} /></dd>
            <dt className="mt-1 opacity-80">{s.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  )
}

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function useGlowOnReach(level = 0.65) {
  const { pathname } = useLocation()
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    const update = () => {
      raf = 0
      const y = window.innerHeight * level
      document.querySelectorAll('[data-glow]').forEach((el) => {
        el.classList.toggle('is-lit', reduce || el.getBoundingClientRect().top < y)
      })
    }
    const queue = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    const t = setTimeout(update, 500) // after images/layout settle
    const ro = new ResizeObserver(queue); ro.observe(document.body)
    window.addEventListener('scroll', queue, { passive: true })
    window.addEventListener('resize', queue)
    return () => {
      clearTimeout(t); cancelAnimationFrame(raf); ro.disconnect()
      window.removeEventListener('scroll', queue); window.removeEventListener('resize', queue)
    }
  }, [pathname, level])
}

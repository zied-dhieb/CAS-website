import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import site from '../../data/site.json'
import GlassChip from './GlassChip.jsx'

function checkWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
  } catch {
    return false
  }
}

export default function Hero() {
  const [hasWebGL, setHasWebGL] = useState(true)

  useEffect(() => {
    setHasWebGL(checkWebGL())
  }, [])

  return (
    <div className="relative overflow-hidden">
      {!hasWebGL && (
        <GlassChip className="pointer-events-none absolute -right-28 top-1/2 hidden w-[560px] -translate-y-1/2 sm:block" />
      )}
      <section className="container-page relative z-10 pb-16 pt-16 sm:pt-28 sm:pb-28">
        <h1 data-node="Home" className="max-w-2xl text-4xl font-bold leading-tight sm:text-6xl">{site.tagline}</h1>
        <div className="card mt-6 max-w-xl">
          <p className="text-lg opacity-90 leading-relaxed">
            The student chapter of the IEEE Circuits and Systems Society at the National School of Electronics and Telecommunications of Sfax.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/contact" className="btn btn-primary">Join the chapter</Link>
          <Link to="/about" className="btn btn-ghost">About us</Link>
        </div>
      </section>
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'
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

const SIGNAL_CHARS = ['0', '1', 'X', '#', '8', 'A', 'E', 'F', 'Z', '9', 'C', 'K']
const TARGET_WORD = "ENET'Com."

function SignalDecodeText() {
  const [displayText, setDisplayText] = useState(() =>
    Array.from(TARGET_WORD).map(c => ({
      char: c,
      isLocked: true
    }))
  )
  const [isDecoding, setIsDecoding] = useState(true)

  const startDecode = useCallback(() => {
    setIsDecoding(true)
    const startTime = performance.now()
    const duration = 700 // ~700ms total decode duration

    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime
      const progress = Math.min(1, elapsed / duration)
      const lockThreshold = Math.floor(progress * (TARGET_WORD.length + 1))

      if (progress >= 1) {
        clearInterval(interval)
        setDisplayText(Array.from(TARGET_WORD).map(c => ({ char: c, isLocked: true })))
        setIsDecoding(false)
        return
      }

      setDisplayText(
        Array.from(TARGET_WORD).map((targetChar, index) => {
          if (index < lockThreshold) {
            return { char: targetChar, isLocked: true }
          }
          const randomChar = SIGNAL_CHARS[Math.floor(Math.random() * SIGNAL_CHARS.length)]
          return { char: randomChar, isLocked: false }
        })
      )
    }, 35)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const cleanup = startDecode()
    return cleanup
  }, [startDecode])

  return (
    <span
      className="inline-block cursor-default select-none text-[#8AD82A]"
      onMouseEnter={() => {
        if (!isDecoding) startDecode()
      }}
      style={{
        fontVariantNumeric: 'tabular-nums',
        textShadow: '0 0 20px rgba(138, 216, 42, 0.45), 0 0 40px rgba(138, 216, 42, 0.2)'
      }}
    >
      {displayText.map((item, idx) => (
        <span
          key={idx}
          className="inline-block text-center"
          style={{
            minWidth: TARGET_WORD[idx] === "'" || TARGET_WORD[idx] === '.' ? '0.32em' : '0.62em',
            fontFamily: item.isLocked ? 'inherit' : 'monospace',
            opacity: item.isLocked ? 1 : 0.9
          }}
        >
          {item.char}
        </span>
      ))}
    </span>
  )
}

export default function Hero() {
  const [hasWebGL, setHasWebGL] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setHasWebGL(checkWebGL())
    setMounted(true)
  }, [])

  return (
    <div className="relative overflow-hidden">
      {!hasWebGL && (
        <GlassChip className="pointer-events-none absolute -right-28 top-1/2 hidden w-[560px] -translate-y-1/2 sm:block" />
      )}
      <section className="container-page relative z-10 pb-16 pt-16 sm:pt-28 sm:pb-28">
        <h1
          data-node="Home"
          className="max-w-2xl text-4xl font-bold sm:text-6xl text-left"
          style={{
            lineHeight: 1.1,
            letterSpacing: '-0.02em'
          }}
        >
          <span className="sr-only">{site.tagline}</span>
          <span aria-hidden="true" className="block">
            <span
              className="block text-white"
              style={{
                transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(12px)'
              }}
            >
              Circuits and systems,
            </span>
            <span
              className="block text-white"
              style={{
                transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.08s, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.08s',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(12px)'
              }}
            >
              built by students at
            </span>
            <span
              className="block mt-1 sm:mt-2"
              style={{
                transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.16s, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.16s',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(12px)'
              }}
            >
              <SignalDecodeText />
            </span>
          </span>
        </h1>
        <div data-glow className="card mt-6 max-w-xl">
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

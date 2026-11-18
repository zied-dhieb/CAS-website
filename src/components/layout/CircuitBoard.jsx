import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

// The living circuit. One glass tube (the trunk) runs down the page; every element marked
// data-node="Label" gets a branch (45-degree bend, like a real PCB) ending in a glass component.
// Current lights the tubes and components as you scroll. Hover to probe and read a voltage.
const TX = 24

function Part({ i, on }) {
  const fill = on ? 'url(#glass-on)' : 'url(#glass-off)'
  const t = i % 3 // resistor, capacitor, LED
  return (
    <g stroke={on ? '#CFFF8A' : '#2E8B2E'} strokeOpacity={on ? 1 : 0.55} strokeWidth="1.5" style={on ? { filter: 'drop-shadow(0 0 7px #6BAA1C)' } : undefined}>
      {t === 0 && <><rect x="-17" y="-8" width="34" height="16" rx="8" fill={fill} />{[-7, 0, 7].map((x) => <path key={x} d={`M${x} -8 V8`} />)}</>}
      {t === 1 && <><rect x="-10" y="-12" width="6" height="24" rx="2" fill={fill} /><rect x="4" y="-12" width="6" height="24" rx="2" fill={fill} /></>}
      {t === 2 && <><circle r="12" fill={fill} /><circle r="4" fill={on ? '#EFFFC9' : 'none'} stroke="none" /></>}
      <ellipse cx="-3" cy="-4" rx="8" ry="2.5" fill="#fff" fillOpacity=".55" stroke="none" transform="rotate(-20)" />
    </g>
  )
}

export default function CircuitBoard() {
  const svg = useRef(null)
  const { pathname } = useLocation()
  const [g, setG] = useState({ h: 0, nodes: [] })
  const [lit, setLit] = useState(0)
  const [hover, setHover] = useState(-1)

  useEffect(() => {
    const root = svg.current?.parentElement
    if (!root) return
    const level = () => setLit(window.innerHeight * 0.65 - root.getBoundingClientRect().top)
    const measure = () => {
      const rb = root.getBoundingClientRect()
      const nodes = [...root.querySelectorAll('[data-node]')].map((el) => {
        const b = el.getBoundingClientRect()
        return { y: b.top - rb.top + b.height / 2, x: b.left - rb.left, label: el.dataset.node }
      })
      setG({ h: rb.height, nodes })
      level()
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(root)
    window.addEventListener('scroll', level, { passive: true })
    window.addEventListener('resize', measure)
    return () => { ro.disconnect(); window.removeEventListener('scroll', level); window.removeEventListener('resize', measure) }
  }, [pathname])

  useEffect(() => {
    const root = svg.current?.parentElement
    if (!root) return
    const rb = root.getBoundingClientRect()
    const els = root.querySelectorAll('[data-node]')
    els.forEach((el, idx) => {
      const b = el.getBoundingClientRect()
      const nodeY = b.top - rb.top + b.height / 2
      const isReached = nodeY < lit || hover === idx

      if (el.classList.contains('card')) {
        el.classList.toggle('circuit-active', isReached)
        el.classList.toggle('card-lit', isReached)
      } else {
        const closestCard = el.closest('.card')
        if (closestCard) {
          closestCard.classList.toggle('circuit-active', isReached)
          closestCard.classList.toggle('card-lit', isReached)
        } else {
          const sectionCards = el.parentElement?.querySelectorAll('.card')
          if (sectionCards && sectionCards.length > 0) {
            sectionCards.forEach((c) => {
              c.classList.toggle('circuit-active', isReached)
              c.classList.toggle('card-lit', isReached)
            })
          }
        }
      }
    })
    return () => {
      els.forEach((el) => {
        const cards = el.classList.contains('card')
          ? [el]
          : (el.closest('.card') ? [el.closest('.card')] : [...(el.parentElement?.querySelectorAll('.card') || [])])
        cards.forEach((c) => {
          c.classList.remove('circuit-active')
          c.classList.remove('card-lit')
        })
      })
    }
  }, [lit, hover, pathname])

  const branch = (n) => `M${TX} ${n.y - 28} l28 28 H${Math.max(n.x - 18, TX + 28)}`
  const paths = (<><path d={`M${TX} 0 V${g.h}`} />{g.nodes.map((n, i) => <path key={i} d={branch(n)} />)}</>)
  const lines = (cls, w, style) => <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={w} className={cls} style={style}>{paths}</g>
  const h = hover >= 0 ? g.nodes[hover] : null

  const litH = Math.max(0, lit)
  const tailFade = 140
  const fadeStart = Math.max(0, litH - tailFade)

  return (
    <svg ref={svg} aria-hidden="true" width="100%" height={g.h} className="pointer-events-none absolute left-0 top-0 hidden lg:block">
      <defs>
        <clipPath id="lit"><rect x="0" y="0" width="9999" height={litH} /></clipPath>
        <linearGradient id="neon-tail-fade" x1="0" y1={fadeStart} x2="0" y2={litH} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </linearGradient>
        <mask id="lit-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="9999" height={litH} style={{ maskType: 'luminance' }}>
          <rect x="0" y="0" width="9999" height={litH} fill="url(#neon-tail-fade)" />
        </mask>
        <linearGradient id="glass-off" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d7efd0" stopOpacity=".6" /><stop offset="1" stopColor="#2E8B2E" stopOpacity=".35" /></linearGradient>
        <linearGradient id="glass-on" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f0ffd2" /><stop offset="1" stopColor="#6BAA1C" /></linearGradient>
      </defs>
      {lines('stroke-brand/20', 9)}
      {lines('stroke-white/50', 2)}
      <g mask="url(#lit-mask)" style={{ mask: 'url(#lit-mask)', WebkitMask: 'url(#lit-mask)' }}>
        {lines('stroke-brand-light/40', 9, { filter: 'drop-shadow(0 0 8px #6BAA1C)' })}
        {lines('stroke-lime-200', 2.5)}
      </g>
      {g.nodes.map((n, i) => (
        <g key={i} transform={`translate(${n.x - 18} ${n.y})`}><Part i={i} on={n.y < lit || hover === i} /></g>
      ))}
      {g.nodes.map((n, i) => (
        <g key={'h' + i}>
          <path d={branch(n)} fill="none" stroke="transparent" strokeWidth="24" style={{ pointerEvents: 'stroke' }} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(-1)} />
          <circle cx={n.x - 18} cy={n.y} r="18" fill="transparent" style={{ pointerEvents: 'all' }} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(-1)} />
        </g>
      ))}
      {h && (
        <g transform={`translate(${TX + 40} ${h.y - 36})`}>
          <rect width="190" height="24" rx="4" fill="#071009" stroke="#6BAA1C" />
          <text x="10" y="16" fontSize="12" fill="#9BD83A">{`U${hover + 1} · ${h.label} · ${h.y < lit ? '3.3' : '0.0'} V`}</text>
        </g>
      )}
      <circle cx={TX} cy="5" r="6" className="fill-lime-200" style={{ filter: 'drop-shadow(0 0 8px #6BAA1C)' }} />
    </svg>
  )
}

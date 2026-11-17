import logo from '../../assets/logos/cas-logo.png'

// A glass microchip drawn in SVG (no image files). The CAS logo is the die; the pins pulse in sequence.
const pins = Array.from({ length: 8 }, (_, i) => 85 + i * 30)

export default function GlassChip({ className = '' }) {
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden="true" style={{ filter: 'drop-shadow(0 30px 40px rgba(10,60,20,.45))' }}>
      <defs>
        <linearGradient id="chip-body" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5ec25a" stopOpacity=".85" /><stop offset="1" stopColor="#0b3d16" stopOpacity=".95" /></linearGradient>
        <linearGradient id="chip-sheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".55" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <linearGradient id="chip-pin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e4f6d6" /><stop offset="1" stopColor="#6BAA1C" /></linearGradient>
        <clipPath id="chip-logo"><circle cx="200" cy="200" r="58" /></clipPath>
      </defs>
      {pins.map((p, i) => (
        <g key={p} className="chip-pin" style={{ animationDelay: `${i * 0.18}s` }} fill="url(#chip-pin)">
          <rect x={p} y="38" width="14" height="36" rx="3" /><rect x={p} y="326" width="14" height="36" rx="3" />
          <rect x="38" y={p} width="36" height="14" rx="3" /><rect x="326" y={p} width="36" height="14" rx="3" />
        </g>
      ))}
      <rect x="70" y="70" width="260" height="260" rx="40" fill="url(#chip-body)" stroke="#CFFF8A" strokeOpacity=".5" strokeWidth="2" />
      <rect x="112" y="112" width="176" height="176" rx="26" fill="#071009" fillOpacity=".6" stroke="#6BAA1C" strokeWidth="2" />
      <image href={logo} x="142" y="142" width="116" height="116" clipPath="url(#chip-logo)" />
      <rect x="80" y="78" width="240" height="96" rx="32" fill="url(#chip-sheen)" opacity=".7" />
    </svg>
  )
}

import { useState } from 'react'
import { Factory, Sprout, Cpu, Rocket } from 'lucide-react'
import data from '../../data/activities.json'

const icons = [Factory, Sprout, Cpu, Rocket]

export default function WhatWeDo({ activeIndex = null, onSelectCard }) {
  const [selected, setSelected] = useState(activeIndex)

  const handleCardClick = (idx) => {
    const next = selected === idx ? null : idx
    setSelected(next)
    if (onSelectCard) onSelectCard(next)
  }

  return (
    <section className="container-page mt-24">
      <h2 data-node="Focus" className="text-3xl font-bold">What we work on</h2>
      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {data.items.map((a, i) => {
          const Icon = icons[i % icons.length]
          const isCardActive = selected === i
          return (
            <li
              key={a.title}
              data-glow
              onClick={() => handleCardClick(i)}
              className={`card cursor-pointer transition-all duration-300 ${isCardActive ? 'card-lit active-glow' : ''}`}
            >
              <span className="gem"><Icon size={26} /></span>
              <h3 className="mt-5 text-xl font-bold">{a.title}</h3>
              <p className="mt-2 opacity-80">{a.text}</p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

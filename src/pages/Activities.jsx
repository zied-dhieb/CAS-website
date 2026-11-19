import { useState, useMemo } from 'react'
import WhatWeDo from '../components/home/WhatWeDo.jsx'
import ExpandableEventsGrid from '../components/events/ExpandableEventsGrid.jsx'
import { events } from '../data/events.js'

export default function Activities() {
  const [categoryFilter, setCategoryFilter] = useState('All')

  // Extract unique categories for filter tabs
  const categories = useMemo(() => {
    const set = new Set(['All'])
    events.forEach((e) => {
      if (e.category) set.add(e.category)
    })
    return Array.from(set)
  }, [])

  const filteredEvents = useMemo(() => {
    if (categoryFilter === 'All') return events
    return events.filter((e) => e.category === categoryFilter)
  }, [categoryFilter])

  return (
    <>
      <section className="container-page pt-16">
        <h1 data-node="Activities" className="text-4xl font-bold sm:text-5xl">Activities</h1>
        <div data-glow className="card mt-6 max-w-2xl">
          <p className="text-lg opacity-90 leading-relaxed">Workshops, trainings, visits and projects around circuits and systems.</p>
        </div>
      </section>

      <WhatWeDo />

      <section className="container-page mt-28">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 data-node="Events" className="text-3xl sm:text-4xl font-bold font-display">
              Events
            </h2>
            <p className="mt-2 text-base opacity-80 max-w-xl">
              Explore our technical workshops, robotics bootcamps, and community initiatives.
            </p>
          </div>

          {/* Category Filter Pills */}
          {categories.length > 2 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`hover-glow-btn px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-brand text-white border-transparent shadow-md'
                      : 'bg-white/10 hover:bg-brand/10 border-brand/20 opacity-80 hover:opacity-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Fluid Aceternity Expandable Grid */}
        <ExpandableEventsGrid events={filteredEvents} />

        {filteredEvents.length === 0 && (
          <div data-glow className="card mt-8 p-8 text-center opacity-70">
            No events found in this category.
          </div>
        )}
      </section>
    </>
  )
}

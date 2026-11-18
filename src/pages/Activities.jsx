import { useState, useMemo } from 'react'
import WhatWeDo from '../components/home/WhatWeDo.jsx'
import EventCard from '../components/events/EventCard.jsx'
import EventModal from '../components/events/EventModal.jsx'
import { events } from '../data/events.js'

export default function Activities() {
  const [selectedEvent, setSelectedEvent] = useState(null)
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
        <div className="card mt-6 max-w-2xl">
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
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    categoryFilter === cat
                      ? 'bg-brand text-white shadow-md'
                      : 'bg-white/10 hover:bg-brand/10 border border-brand/20 opacity-80 hover:opacity-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Events Grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onSelect={() => setSelectedEvent(event)}
            />
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="card mt-8 p-8 text-center opacity-70">
            No events found in this category.
          </div>
        )}
      </section>

      {/* Expanded Modal Dashboard */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </>
  )
}

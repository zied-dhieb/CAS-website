import React, { memo, useCallback, useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X, ChevronLeft, ChevronRight, Images, Calendar, Tag } from 'lucide-react'
import { useOutsideClick } from '@/hooks/use-outside-click'

// Fast, snappy spring transition shared across morphing elements for fluid 60fps animation
const SPRING_TRANSITION = {
  type: 'spring',
  stiffness: 350,
  damping: 32,
  mass: 0.8,
}

// Memoized Event Card for fast rendering and zero stutter on modal open
const EventCardItem = memo(function EventCardItem({ event, onSelect, id }) {
  const photoCount = event.images?.length || 0

  return (
    <motion.li
      layoutId={`card-${event.id}-${id}`}
      transition={SPRING_TRANSITION}
      onClick={() => onSelect(event)}
      className="event-card card group cursor-pointer flex flex-col justify-between p-4 sm:p-5 h-full"
    >
      <div>
        <div className="overflow-hidden rounded-bl-[1.5rem] rounded-tr-[1.5rem] border border-brand/25 bg-black/20 aspect-[16/10] relative flex items-center justify-center">
          {event.cover ? (
            <img
              src={event.cover}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-brand/60">
              <Images size={36} />
            </div>
          )}

          {photoCount > 1 && (
            <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-black/70 text-white backdrop-blur-sm border border-white/15">
              <Images size={13} />
              <span>{photoCount}</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col">
          <motion.span
            layoutId={`category-${event.id}-${id}`}
            transition={SPRING_TRANSITION}
            className="inline-block self-start px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-brand/15 text-brand dark:text-brand-light border border-brand/30"
          >
            {event.category}
          </motion.span>

          <motion.h3
            layoutId={`title-${event.id}-${id}`}
            transition={SPRING_TRANSITION}
            className="mt-2.5 font-display text-lg sm:text-xl font-bold tracking-tight text-ink dark:text-paper group-hover:text-brand dark:group-hover:text-brand-light transition-colors line-clamp-2"
          >
            {event.title}
          </motion.h3>
        </div>
      </div>

      <div className="mt-4 pt-3 flex items-center justify-between border-t border-brand/10 dark:border-brand-light/10 text-xs font-semibold text-brand dark:text-brand-light">
        <span>Click to expand</span>
        <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
      </div>
    </motion.li>
  )
})

export default function ExpandableEventsGrid({ events = [] }) {
  const [active, setActive] = useState(null)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [ready, setReady] = useState(false)
  const id = useId()
  const modalRef = useRef(null)

  const handleSelectEvent = useCallback((event) => {
    setPhotoIndex(0)
    setReady(false)
    setActive(event)
  }, [])

  const handleClose = useCallback(() => {
    setReady(false)
    setActive(null)
  }, [])

  // Defer heavy secondary thumbnail rendering slightly so the layout morph runs without CPU choke
  useEffect(() => {
    if (active) {
      const timer = setTimeout(() => setReady(true), 140)
      return () => clearTimeout(timer)
    } else {
      setReady(false)
    }
  }, [active])

  // Keyboard navigation, body scroll lock, and navbar hide
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        handleClose()
      }
      if (active && active.images?.length > 1) {
        if (e.key === 'ArrowLeft') {
          setPhotoIndex((prev) => (prev - 1 + active.images.length) % active.images.length)
        }
        if (e.key === 'ArrowRight') {
          setPhotoIndex((prev) => (prev + 1) % active.images.length)
        }
      }
    }

    if (active) {
      document.body.style.overflow = 'hidden'
      document.body.classList.add('modal-open')
      window.addEventListener('keydown', onKeyDown)
    } else {
      document.body.style.overflow = 'auto'
      document.body.classList.remove('modal-open')
    }

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = 'auto'
      document.body.classList.remove('modal-open')
    }
  }, [active, handleClose])

  useOutsideClick(modalRef, handleClose)

  const activeImages = active?.images || []
  const currentPhoto = activeImages[photoIndex]

  const nextPhoto = (e) => {
    e.stopPropagation()
    setPhotoIndex((prev) => (prev + 1) % activeImages.length)
  }

  const prevPhoto = (e) => {
    e.stopPropagation()
    setPhotoIndex((prev) => (prev - 1 + activeImages.length) % activeImages.length)
  }

  return (
    <>
      {/* 1. Backdrop overlay with lightweight blur to maximize GPU framerate */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm h-full w-full z-[9998]"
          />
        )}
      </AnimatePresence>

      {/* 2. Expanded Card Modal with Optimized Aceternity Morph Animation */}
      <AnimatePresence>
        {active && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 lg:p-8">
            {/* Outer shell: border, asymmetric radius, glow, overflow-hidden, flex flex-col */}
            <motion.div
              layoutId={`card-${active.id}-${id}`}
              ref={modalRef}
              transition={SPRING_TRANSITION}
              onAnimationComplete={() => setReady(true)}
              className="card relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden !p-0 bg-paper text-ink dark:bg-[#071009] dark:text-paper border border-brand-light/40 shadow-[0_0_35px_rgba(107,170,28,0.35)] rounded-bl-[2.5rem] rounded-tr-[2.5rem]"
            >
              {/* Close (X) button stays absolute on the outer shell so it does not scroll away */}
              <button
                onClick={handleClose}
                className="hover-glow-icon absolute right-4 top-4 z-20 flex items-center justify-center bg-black/60 text-white rounded-full h-9 w-9 sm:h-10 sm:w-10 backdrop-blur-sm border border-white/20 shadow-md cursor-pointer"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              {/* Inner div with class modal-scroll: flex-1 overflow-y-auto, the ONLY scroller holding all content */}
              <div className="modal-scroll flex-1 overflow-y-auto p-6 sm:p-10">
                {/* 1. TOP HEADER: Badge and Event Title */}
                <div className="relative pr-12 sm:pr-14 flex flex-col flex-shrink-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <motion.span
                      layoutId={`category-${active.id}-${id}`}
                      transition={SPRING_TRANSITION}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand/20 text-brand dark:text-brand-light border border-brand/35"
                    >
                      <Tag size={12} />
                      {active.category}
                    </motion.span>
                    {active.date && (
                      <span className="inline-flex items-center gap-1 text-xs opacity-75">
                        <Calendar size={13} />
                        {active.date}
                      </span>
                    )}
                  </div>

                  <motion.h2
                    layoutId={`title-${active.id}-${id}`}
                    transition={SPRING_TRANSITION}
                    className="mt-3 text-2xl sm:text-3xl font-bold font-display tracking-tight text-ink dark:text-paper"
                  >
                    {active.title}
                  </motion.h2>
                </div>

                {/* 2. INNER CONTENT: Smooth fade-in so layout computation does not hitch opening frame */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, delay: 0.04 }}
                  className="mt-5 flex flex-col flex-1"
                >
                  {/* Main Photo Slider (Uses already-cached cover image on frame 0) */}
                  <div className="relative w-full h-56 sm:h-72 md:h-80 max-h-[380px] bg-black/70 rounded-bl-[1.75rem] rounded-tr-[1.75rem] overflow-hidden border border-brand/25 flex items-center justify-center flex-shrink-0">
                    <img
                      src={currentPhoto?.url || active.cover}
                      alt={active.title}
                      className="w-full h-full object-contain"
                      decoding="async"
                    />

                    {/* Slider Navigation Arrows */}
                    {activeImages.length > 1 && (
                      <>
                        <button
                          onClick={prevPhoto}
                          className="hover-glow-icon no-transform absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/65 text-white backdrop-blur-sm border border-white/20 cursor-pointer shadow-md z-10"
                          aria-label="Previous photo"
                        >
                          <ChevronLeft size={22} />
                        </button>
                        <button
                          onClick={nextPhoto}
                          className="hover-glow-icon no-transform absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/65 text-white backdrop-blur-sm border border-white/20 cursor-pointer shadow-md z-10"
                          aria-label="Next photo"
                        >
                          <ChevronRight size={22} />
                        </button>

                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold bg-black/75 text-white backdrop-blur-sm border border-white/20 z-10">
                          {photoIndex + 1} / {activeImages.length}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Compact Thumbnail Selector Strip (Mounted smoothly when ready, zero opening freeze) */}
                  {activeImages.length > 1 && (
                    <div
                      className={`mt-3.5 w-full h-[68px] min-h-[68px] flex-shrink-0 flex items-center gap-2.5 overflow-x-auto overflow-y-hidden py-1 px-1 no-scrollbar touch-pan-x transition-opacity duration-200 ${
                        ready ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {ready &&
                        activeImages.map((img, idx) => (
                          <button
                            key={img.fileName || idx}
                            onClick={() => setPhotoIndex(idx)}
                            className={`hover-glow-btn relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border cursor-pointer ${
                              photoIndex === idx
                                ? 'ring-2 ring-brand-light ring-offset-2 ring-offset-black/50 border-transparent opacity-100 shadow-md'
                                : 'border-white/15 opacity-55 hover:opacity-95'
                            }`}
                            style={{ width: '80px', height: '56px', flexShrink: 0 }}
                          >
                            <img
                              src={img.url}
                              alt=""
                              className="w-full h-full object-cover pointer-events-none"
                              loading="lazy"
                              decoding="async"
                            />
                          </button>
                        ))}
                    </div>
                  )}

                  {/* Description Paragraphs with Smooth Vertical Scroll */}
                  <div className="mt-6 pt-5 border-t border-brand/15 dark:border-brand-light/15 flex flex-col">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-brand dark:text-brand-light mb-3">
                      About this event
                    </h3>
                    <div className="space-y-4 text-base sm:text-lg opacity-90 leading-relaxed font-body">
                      {active.description ? (
                        active.description.split(/\n\s*\n/).map((para, i) => (
                          <p key={i} className="whitespace-pre-line">
                            {para.trim()}
                          </p>
                        ))
                      ) : (
                        <p className="italic opacity-60">No additional description available.</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Grid of Cards with Preserved Aceternity Morph Animation */}
      <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
        {events.map((event) => (
          <EventCardItem
            key={event.id}
            event={event}
            onSelect={handleSelectEvent}
            id={id}
          />
        ))}
      </ul>
    </>
  )
}

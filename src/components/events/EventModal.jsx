import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Calendar, Tag } from 'lucide-react'

export default function EventModal({ event, onClose }) {
  const [photoIndex, setPhotoIndex] = useState(0)

  const images = event?.images || []
  const hasImages = images.length > 0
  const currentImage = images[photoIndex]

  const nextPhoto = (e) => {
    if (e) e.stopPropagation()
    setPhotoIndex((prev) => (prev + 1) % images.length)
  }

  const prevPhoto = (e) => {
    if (e) e.stopPropagation()
    setPhotoIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  // Keyboard navigation & scroll locking
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && images.length > 1) prevPhoto()
      if (e.key === 'ArrowRight' && images.length > 1) nextPhoto()
    }
    window.addEventListener('keydown', handleKeyDown)

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [event, images.length])

  if (!event) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 lg:p-8 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="card relative w-full max-w-4xl max-h-[92vh] flex flex-col p-5 sm:p-7 md:p-8 overflow-y-auto bg-paper text-ink dark:bg-[#071009] dark:text-paper border border-brand-light/35 shadow-2xl rounded-bl-[2.5rem] rounded-tr-[2.5rem]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-black/10 dark:bg-white/10 hover:bg-brand/20 text-ink dark:text-paper transition-colors z-10"
          aria-label="Close modal"
        >
          <X size={22} />
        </button>

        {/* Header */}
        <div className="pr-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand/20 text-brand dark:text-brand-light border border-brand/30">
              <Tag size={12} />
              {event.category}
            </span>
            {event.date && (
              <span className="inline-flex items-center gap-1 text-xs opacity-75">
                <Calendar size={13} />
                {event.date}
              </span>
            )}
          </div>
          <h2 className="mt-3 text-2xl sm:text-3xl font-bold font-display tracking-tight text-ink dark:text-paper">
            {event.title}
          </h2>
        </div>

        {/* Gallery Section */}
        {hasImages && (
          <div className="mt-6 flex flex-col">
            {/* Main Featured Photo */}
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[460px] bg-black/50 rounded-bl-[1.75rem] rounded-tr-[1.75rem] overflow-hidden border border-brand/25 flex items-center justify-center">
              <img
                src={currentImage?.url}
                alt={`${event.title} photo ${photoIndex + 1}`}
                className="w-full h-full object-contain"
              />

              {/* Prev / Next Controls */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 text-white hover:bg-brand transition-colors backdrop-blur-sm border border-white/20"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 text-white hover:bg-brand transition-colors backdrop-blur-sm border border-white/20"
                    aria-label="Next photo"
                  >
                    <ChevronRight size={22} />
                  </button>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold bg-black/70 text-white backdrop-blur-sm border border-white/20">
                    {photoIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {images.map((img, idx) => (
                  <button
                    key={img.fileName || idx}
                    onClick={() => setPhotoIndex(idx)}
                    className={`relative flex-shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden border transition-all ${
                      photoIndex === idx
                        ? 'ring-2 ring-brand-light border-transparent scale-105 opacity-100'
                        : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Text Description */}
        <div className="mt-6 pt-6 border-t border-brand/15 dark:border-brand-light/15">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-brand dark:text-brand-light mb-3">
            About this event
          </h3>
          <div className="space-y-4 text-base sm:text-lg opacity-90 leading-relaxed font-body">
            {event.description ? (
              event.description.split(/\n\s*\n/).map((para, i) => (
                <p key={i} className="whitespace-pre-line">
                  {para.trim()}
                </p>
              ))
            ) : (
              <p className="italic opacity-60">No additional description available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

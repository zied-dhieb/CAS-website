import { useState, useEffect } from 'react'
import PhotoSlot from '../ui/PhotoSlot.jsx'

const galleryModules = import.meta.glob('../../assets/gallery/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default'
})

const galleryImages = Object.values(galleryModules)

export default function FamilyWall() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = e => setReducedMotion(e.matches)
    mq.addEventListener?.('change', handler)
    return () => mq.removeEventListener?.('change', handler)
  }, [])

  if (galleryImages.length < 3) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <PhotoSlot about="CASS family photo" className="aspect-[4/5] frame" />
        <PhotoSlot about="CASS family photo" className="aspect-square frame" />
        <PhotoSlot about="CASS family photo" className="aspect-[4/5] frame hidden md:block" />
      </div>
    )
  }

  // Static grid for reduced motion users
  if (reducedMotion) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {galleryImages.slice(0, 6).map((src, i) => (
          <div key={i} className="frame relative overflow-hidden">
            <div className={`w-full ${i % 2 === 0 ? 'aspect-[4/5]' : 'aspect-square'}`}>
              <img
                src={src}
                alt="CASS ENET'Com community moment"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand/25 to-transparent" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Split images into 3 columns
  const col0 = galleryImages.filter((_, i) => i % 3 === 0)
  const col1 = galleryImages.filter((_, i) => i % 3 === 1)
  const col2 = galleryImages.filter((_, i) => i % 3 === 2)
  const columns = [col0, col1, col2]

  return (
    <div className="family-wall-wrapper">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 h-full">
        {columns.map((colImages, colIdx) => (
          <div
            key={colIdx}
            className={`overflow-hidden ${colIdx === 2 ? 'hidden md:block' : 'block'}`}
          >
            <div className={`flex flex-col family-wall-track family-wall-track-${colIdx}`}>
              {/* Primary list */}
              <div className="flex flex-col gap-3 md:gap-4 pb-3 md:pb-4">
                {colImages.map((src, i) => (
                  <div key={`tile-${colIdx}-${i}`} className="family-wall-tile frame relative overflow-hidden">
                    <div className={`w-full ${(i + colIdx) % 2 === 0 ? 'aspect-[4/5]' : 'aspect-square'}`}>
                      <img
                        src={src}
                        alt="CASS ENET'Com community moment"
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand/25 to-transparent" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Seamless duplicate copy */}
              <div className="flex flex-col gap-3 md:gap-4 pb-3 md:pb-4" aria-hidden="true">
                {colImages.map((src, i) => (
                  <div key={`tile-dup-${colIdx}-${i}`} className="family-wall-tile frame relative overflow-hidden">
                    <div className={`w-full ${(i + colIdx) % 2 === 0 ? 'aspect-[4/5]' : 'aspect-square'}`}>
                      <img
                        src={src}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand/25 to-transparent" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

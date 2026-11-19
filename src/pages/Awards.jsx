import award2026Fallback from '../assets/images/award-2026.png'
import medalSvg from '../assets/awards/medal.svg'
import PhotoSlot from '../components/ui/PhotoSlot.jsx'
import awardsData from '../data/awards.json'

const awardPhotos = import.meta.glob('../assets/awards/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
})

function getAwardPhoto(photoKey, awardId) {
  if (photoKey) {
    for (const path in awardPhotos) {
      if (path.includes(photoKey)) {
        return awardPhotos[path]
      }
    }
  }
  // For 2026 only, fall back to src/assets/images/award-2026.png before showing placeholder
  if (awardId === 'chapter-2026' || (photoKey && photoKey.includes('2026'))) {
    return award2026Fallback
  }
  return null
}

export default function Awards() {
  return (
    <div className="container-page pt-16 pb-24">
      <h1 data-node="Awards" className="text-4xl font-bold sm:text-5xl">
        Awards
      </h1>

      <div className="mt-16 space-y-20">
        {awardsData.items.map((award, index) => {
          const isEven = index % 2 === 0
          const photo = getAwardPhoto(award.photo, award.id)

          return (
            <section
              key={award.id}
              id={award.id}
              className="scroll-mt-28"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                {/* Photo Column: always first on mobile, alternating left/right on lg */}
                <div className={isEven ? 'order-1 lg:order-1' : 'order-1 lg:order-2'}>
                  {photo ? (
                    <div className="frame w-full aspect-[16/10] overflow-hidden">
                      <img
                        src={photo}
                        alt={`${award.title}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  ) : (
                    <PhotoSlot
                      about={award.title}
                      className="frame w-full aspect-[16/10]"
                    />
                  )}
                </div>

                {/* Text Column: always second on mobile, alternating right/left on lg */}
                <div className={isEven ? 'order-2 lg:order-2' : 'order-2 lg:order-1'}>
                  <div data-glow className="card p-6 sm:p-8">
                    <div className="flex items-center gap-3">
                      <img
                        src={medalSvg}
                        alt=""
                        className="w-14 h-auto object-contain shrink-0"
                      />
                      <span className="inline-flex items-center rounded-full border border-brand/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand dark:text-brand-light font-mono">
                        {award.year}
                      </span>
                    </div>

                    <h2 className="mt-5 font-display text-2xl font-bold leading-snug text-ink dark:text-paper">
                      {award.title}
                    </h2>

                    <p className="mt-4 text-base sm:text-lg opacity-85 leading-relaxed font-body">
                      {award.text}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

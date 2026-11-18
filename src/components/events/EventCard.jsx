import { Images } from 'lucide-react'

export default function EventCard({ event, onSelect }) {
  const photoCount = event.images?.length || 0

  return (
    <article
      onClick={onSelect}
      className="board-card card group cursor-pointer flex flex-col h-full p-4 sm:p-5 transition-all duration-300"
    >
      <div className="overflow-hidden rounded-bl-[1.5rem] rounded-tr-[1.5rem] border border-brand/25 bg-black/20 aspect-[16/10] relative flex items-center justify-center">
        {event.cover ? (
          <img
            src={event.cover}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
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

      <div className="mt-4 flex flex-col flex-grow justify-between">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-brand/15 text-brand dark:text-brand-light border border-brand/30">
            {event.category}
          </span>

          <h3 className="mt-2.5 font-display text-lg sm:text-xl font-bold tracking-tight text-ink dark:text-paper group-hover:text-brand dark:group-hover:text-brand-light transition-colors line-clamp-2">
            {event.title}
          </h3>
        </div>
      </div>
    </article>
  )
}

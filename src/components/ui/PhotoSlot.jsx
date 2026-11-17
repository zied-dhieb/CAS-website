// Stands in for a real photo. Replace with an <img> when the photo arrives.
// "about" describes the photo we need, e.g. "the board at the 2025 workshop".
export default function PhotoSlot({ about, className = 'aspect-[4/3]' }) {
  return (
    <div
      role="img"
      aria-label={`Photo placeholder: ${about}`}
      className={`flex items-center justify-center rounded-md border-2 border-dashed border-yellow-500 bg-yellow-100/60 p-4 text-center text-sm font-medium text-yellow-900 ${className}`}
    >
      Photo needed: {about}
    </div>
  )
}

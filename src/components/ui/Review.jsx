// Visible marker for any text, date or number that must be checked before launch.
// Search the project for "<Review" to list everything still unverified.
export default function Review({ children = 'Needs review', note }) {
  return (
    <span
      title={note}
      className="inline-block rounded bg-yellow-200 px-1.5 py-0.5 align-middle text-xs font-semibold text-yellow-900"
    >
      {children}
    </span>
  )
}

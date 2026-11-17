import { Link } from 'react-router-dom'

export default function ComingSoon({ name }) {
  const notFound = name === '404'
  return (
    <section className="container-page py-24">
      <h1 className="text-4xl font-bold">{notFound ? 'This page does not exist' : `The ${name} page is not built yet`}</h1>
      <p className="mt-4 max-w-lg opacity-80">
        {notFound ? 'Check the address, or go back to the home page.' : 'It is next on the build list. Go back to the home page for now.'}
      </p>
      <Link to="/" className="btn btn-primary mt-8">Back to home</Link>
    </section>
  )
}

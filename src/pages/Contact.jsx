import { Linkedin, Instagram, Facebook, MapPin, Mail } from 'lucide-react'
import site from '../data/site.json'
import Review from '../components/ui/Review.jsx'

const socials = [['LinkedIn', Linkedin, site.socials.linkedin], ['Instagram', Instagram, site.socials.instagram], ['Facebook', Facebook, site.socials.facebook]]

export default function Contact() {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.contact.address)}`

  return (
    <>
      <section className="container-page pt-16">
        <h1 data-node="Contact us" className="text-4xl font-bold sm:text-5xl">Contact us</h1>
        <div data-glow className="card mt-6 max-w-xl">
          <p className="text-lg opacity-90 leading-relaxed">Questions about the chapter or how to join? Reach us here.</p>
        </div>
      </section>
      <section className="container-page mt-16">
        <h2 data-node="Channels" className="text-3xl font-bold">Find us</h2>
        <div data-glow className="card mt-4 max-w-xl space-y-3 font-body">
          <a
            href={`mailto:${site.contact.email}`}
            className="flex items-center gap-2.5 transition-colors hover:text-brand dark:hover:text-brand-light break-words"
          >
            <Mail size={18} className="shrink-0 text-brand dark:text-brand-light" />
            <span className="break-all font-medium">{site.contact.email}</span>
          </a>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-start gap-2.5 transition-colors hover:text-brand dark:hover:text-brand-light"
          >
            <MapPin size={18} className="shrink-0 mt-0.5 text-brand dark:text-brand-light" />
            <span className="leading-relaxed">{site.contact.address}</span>
          </a>
        </div>
        <ul className="mt-6 flex flex-wrap gap-3">
          {socials.map(([name, Icon, href]) => (
            <li key={name}><a href={href} target="_blank" rel="noreferrer" className="btn btn-ghost"><Icon size={18} />{name}</a></li>
          ))}
        </ul>
        <p className="mt-6 text-sm opacity-70">A contact form needs an email service. Tell me if you want one. <Review>Decision needed</Review></p>
      </section>
    </>
  )
}

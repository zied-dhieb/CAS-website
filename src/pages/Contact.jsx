import { Linkedin, Instagram, Facebook } from 'lucide-react'
import site from '../data/site.json'
import Review from '../components/ui/Review.jsx'

const socials = [['LinkedIn', Linkedin, site.socials.linkedin], ['Instagram', Instagram, site.socials.instagram], ['Facebook', Facebook, site.socials.facebook]]

export default function Contact() {
  return (
    <>
      <section className="container-page pt-16">
        <h1 data-node="Contact us" className="text-4xl font-bold sm:text-5xl">Contact us</h1>
        <p className="mt-6 max-w-xl text-lg opacity-85">Questions about the chapter or how to join? Reach us here.</p>
      </section>
      <section className="container-page mt-16">
        <h2 data-node="Channels" className="text-3xl font-bold">Find us</h2>
        <p className="mt-4 opacity-85">Email: {site.contact.email} <Review /></p>
        <p className="mt-1 opacity-85">Address: {site.contact.address} <Review /></p>
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

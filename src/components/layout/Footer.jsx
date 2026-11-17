import { Linkedin, Instagram, Facebook } from 'lucide-react'
import site from '../../data/site.json'
import Review from '../ui/Review.jsx'
import sbLogo from '../../assets/logos/enetcom-sb-logo.png'
import schoolLogo from '../../assets/logos/enetcom-school-logo.png'

const socials = [
  ['LinkedIn', Linkedin, site.socials.linkedin],
  ['Instagram', Instagram, site.socials.instagram],
  ['Facebook', Facebook, site.socials.facebook],
]

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-ink/10 py-12 dark:border-paper/10">
      <div className="container-page grid gap-10 md:grid-cols-3">
        <div>
          <p className="font-display text-lg font-bold">{site.fullName}</p>
          <p className="mt-3 text-sm opacity-80">{site.contact.address} <Review /></p>
          <p className="mt-1 text-sm opacity-80">{site.contact.email} <Review /></p>
        </div>
        <div>
          <p className="font-semibold">Follow us</p>
          <ul className="mt-3 flex gap-4">
            {socials.map(([name, Icon, href]) => (
              <li key={name}>
                <a href={href} target="_blank" rel="noreferrer" aria-label={name} className="hover:text-brand">
                  <Icon size={22} />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold">Part of</p>
          <div className="mt-3 flex flex-col items-start gap-4">
            <img src={sbLogo} alt="IEEE ENET'Com Student Branch" className="h-10 w-auto" />
            <img src={schoolLogo} alt="ENET'Com, National School of Electronics and Telecommunications of Sfax" className="h-12 w-auto" />
          </div>
        </div>
      </div>
    </footer>
  )
}

import { Link } from 'react-router-dom'
import { Linkedin, Instagram, Facebook, MapPin, Mail } from 'lucide-react'
import site from '../../data/site.json'
import sbLogo from '../../assets/logos/enetcom-sb-logo.png'

const exploreLinks = [
  { label: 'Home', to: '/' },
  { label: 'About us', to: '/about' },
  { label: 'Activities', to: '/activities' },
  { label: 'Awards', to: '/awards' },
  { label: 'Contact us', to: '/contact' },
]

const socials = [
  { name: 'LinkedIn', icon: Linkedin, href: site.socials.linkedin },
  { name: 'Instagram', icon: Instagram, href: site.socials.instagram },
  { name: 'Facebook', icon: Facebook, href: site.socials.facebook },
]

export default function Footer() {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.contact.address)}`

  return (
    <footer className="site-footer mt-24">
      {/* Top hairline trace with glowing node */}
      <div data-glow className="footer-hairline">
        <div className="container-page relative h-0">
          <span className="footer-node" />
        </div>
      </div>

      <div className="container-page py-12 md:py-14">
        {/* 4-column responsive grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1.2fr_1fr] gap-10 items-start">
          {/* Column 1, chapter info */}
          <div className="flex flex-col items-start">
            <p className="font-display font-bold text-xl text-ink dark:text-paper leading-snug max-w-sm">
              {site.fullName}
            </p>
            <p className="mt-2 text-sm opacity-75 font-body leading-relaxed">
              {site.tagline}
            </p>
            <ul className="mt-5 flex items-center gap-3">
              {socials.map(({ name, icon: Icon, href }) => (
                <li key={name}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={name}
                    className="social-btn"
                  >
                    <Icon size={18} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2, Explore */}
          <div className="flex flex-col items-start">
            <h3 className="font-mono text-xs uppercase tracking-widest text-brand dark:text-brand-light font-semibold">
              Explore
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              {exploreLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="footer-link text-sm opacity-85 hover:opacity-100 hover:text-brand dark:hover:text-brand-light font-body"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3, Contact */}
          <div className="flex flex-col items-start">
            <h3 className="font-mono text-xs uppercase tracking-widest text-brand dark:text-brand-light font-semibold">
              Contact
            </h3>
            <div className="mt-3 flex flex-col gap-3 text-sm opacity-85 font-body">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-2.5 transition-colors hover:text-brand dark:hover:text-brand-light group"
              >
                <MapPin size={18} className="shrink-0 mt-0.5 text-brand dark:text-brand-light" />
                <span className="leading-relaxed break-words">{site.contact.address}</span>
              </a>
              <a
                href={`mailto:${site.contact.email}`}
                className="flex items-start gap-2.5 transition-colors hover:text-brand dark:hover:text-brand-light group break-words"
              >
                <Mail size={18} className="shrink-0 mt-0.5 text-brand dark:text-brand-light" />
                <span className="break-all">{site.contact.email}</span>
              </a>
            </div>
          </div>

          {/* Column 4, Part of / IEEE ENET'Com SB */}
          <div className="flex flex-col items-start lg:items-end">
            <span className="text-xs uppercase tracking-widest opacity-70 font-mono">
              Part of
            </span>
            <a
              href="https://enetcom.ieee.tn"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="IEEE ENET'Com Student Branch website (opens in a new tab)"
              className="footer-sb-link mt-3"
            >
              <img
                src={sbLogo}
                alt="IEEE ENET'Com Student Branch"
                className="h-14 lg:h-16 w-auto object-contain"
              />
            </a>
          </div>
        </div>

        {/* Bottom row: copyright */}
        <div className="mt-12 border-t border-brand/20 pt-5">
          <p className="text-xs opacity-70 font-body">
            © 2026 IEEE CAS ENET'Com SBC
          </p>
        </div>
      </div>
    </footer>
  )
}

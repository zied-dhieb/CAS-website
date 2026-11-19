import { useState, useRef, useEffect } from 'react'
import { Linkedin, Instagram, Facebook, MapPin, Mail, Copy, Check, ExternalLink } from 'lucide-react'
import site from '../data/site.json'
import ContactForm from '../components/contact/ContactForm.jsx'

const socials = [
  ['LinkedIn', Linkedin, site.socials.linkedin],
  ['Instagram', Instagram, site.socials.instagram],
  ['Facebook', Facebook, site.socials.facebook],
]

export default function Contact() {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.contact.address)}`
  const [copied, setCopied] = useState(false)
  const copyTimeoutRef = useRef(null)

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.contact.email)
      setCopied(true)
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1800)
    } catch {
      // Fallback if clipboard API is not available
    }
  }

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
    }
  }, [])

  return (
    <>
      <section className="container-page pt-16">
        <h1 data-node="Contact us" className="text-4xl font-bold sm:text-5xl">
          Contact us
        </h1>
        <div data-glow className="card mt-6 max-w-xl">
          <p className="text-lg opacity-90 leading-relaxed">
            Questions about the chapter or how to join? Reach us here.
          </p>
        </div>
      </section>

      <section className="container-page mt-14 mb-8 grid items-start gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        {/* Left Column: Find us tiles */}
        <div>
          <h2 data-node="Find us" className="text-3xl font-bold">
            Find us
          </h2>
          <div className="mt-4 flex flex-col gap-4">
            {/* Tile a: Email */}
            <div data-glow className="card relative flex items-center gap-4 p-4">
              <span className="gem !h-11 !w-11 shrink-0 !rounded-xl">
                <Mail size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <span className="block font-mono text-xs font-semibold uppercase tracking-widest text-brand dark:text-brand-light">
                  Email
                </span>
                <a
                  href={`mailto:${site.contact.email}`}
                  className="block break-all font-medium transition-colors hover:text-brand dark:hover:text-brand-light"
                >
                  {site.contact.email}
                </a>
              </div>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="hover-glow-icon shrink-0 rounded-full p-2"
                aria-label="Copy email address"
              >
                {copied ? (
                  <Check size={18} className="text-brand dark:text-brand-light" />
                ) : (
                  <Copy size={18} />
                )}
              </button>
              <span className="sr-only" aria-live="polite">
                {copied ? 'Email address copied' : ''}
              </span>
              <span className="channel-trace" aria-hidden="true" />
            </div>

            {/* Tile b: Address */}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              data-glow
              className="card group relative flex items-center gap-4 p-4 text-inherit no-underline"
            >
              <span className="gem !h-11 !w-11 shrink-0 !rounded-xl">
                <MapPin size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <span className="block font-mono text-xs font-semibold uppercase tracking-widest text-brand dark:text-brand-light">
                  Address
                </span>
                <span className="block text-sm leading-snug">
                  {site.contact.address}
                </span>
              </div>
              <ExternalLink
                size={18}
                className="shrink-0 opacity-60 transition-opacity group-hover:opacity-100"
              />
              <span className="channel-trace" aria-hidden="true" />
            </a>

            {/* Tile c: Social */}
            <div data-glow className="card relative flex items-center justify-between gap-4 p-4">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-brand dark:text-brand-light">
                Follow us
              </span>
              <div className="flex items-center gap-3">
                {socials.map(([name, Icon, href]) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="social-btn"
                    aria-label={name}
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
              <span className="channel-trace" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div>
          <h2 className="text-3xl font-bold">Write to us</h2>
          <div data-glow className="card mt-4 p-6 sm:p-7">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  )
}

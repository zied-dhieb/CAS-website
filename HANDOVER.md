# Handover: Contact Form & Contact Page Implementation

## Overview
This document summarizes the full implementation of the contact form and the restructuring of the Contact page on the IEEE CAS ENET'Com SBC website (`cas-enetcom-website`). The backend is completely serverless and database-free, powered by the **Web3Forms** API.

---

## 1. Configuration & Site Data (`src/data/site.json`)

### Web3Forms Endpoint & Access Key
The form configuration was added to `site.json`:
- `endpoint`: `"https://api.web3forms.com/submit"`
- `accessKey`: `"d27d8038-af6f-4371-b677-2e60d82f4abb"`

### Bug Fix: Email Placeholder
A literal placeholder string `"[EMAIL_ADDRESS]"` in `site.contact.email` was identified and replaced with the actual chapter address: `"cass-enetcom@ieee.tn"`.

```json
{
  "name": "IEEE CAS ENET'Com SBC",
  "fullName": "IEEE Circuits and Systems Society, ENET'Com Student Branch Chapter",
  "tagline": "Circuits and systems, built by students at ENET'Com.",
  "socials": {
    "linkedin": "https://www.linkedin.com/company/ieee-cass-enetcom-sbc/home/",
    "instagram": "https://www.instagram.com/ieee.cass.enetcom.sbc",
    "facebook": "https://www.facebook.com/IEEE.ENETCOM.CAS.SBC"
  },
  "contact": {
    "email": "cass-enetcom@ieee.tn",
    "address": "Route de Tunis km 10, Cité El Ons, Technopôle de Sfax, 3018 Sfax (Sakiet Ezzit), Tunisie"
  },
  "form": {
    "endpoint": "https://api.web3forms.com/submit",
    "accessKey": "d27d8038-af6f-4371-b677-2e60d82f4abb"
  }
}
```

---

## 2. Contact Form Component (`src/components/contact/ContactForm.jsx`)

### Key Architecture & Logic
1. **State Machine (`status`)**:
   - `'idle'`: Form ready for submission.
   - `'sending'`: Disables button, renders loading spinner, prevents double submissions.
   - `'success'`: Replaces form with confirmation screen (`aria-live="polite"`), keeping height stable (`min-h-[22rem]`) to avoid layout jumps.
   - `'error'`: Keeps entered field values intact, surfaces a `role="alert"` notification above the submit row with a direct `mailto:` link to `site.contact.email`.
2. **Access Key Guard**:
   - If `accessKey` is missing, empty, or starts with `"PASTE"`, network submission is prevented and status immediately transitions to `'error'`.
3. **Spam Honeypot (`botcheck`)**:
   - Web3Forms convention using a visually hidden checkbox off-screen (`left: -9999px`, `tabIndex={-1}`, `aria-hidden="true"`).
   - If checked by automated bots, the form halts network requests and silently pretends `'success'`.
   - When legitimate users submit, `botcheck: false` is passed in the payload.
4. **Privacy / Console Security**:
   - Access key and message content are never logged to `console.log` / `console.error`.
5. **Topics**:
   - Pill radio selection supporting:
     - `"Joining the chapter"` (default)
     - `"Collaboration or partnership"`
     - `"A question"`
     - `"Something else"`
6. **Form Reset**:
   - The "Send another message" button resets the state to `'idle'` and clears the form inputs.

### Full Component Code:
```jsx
import { useState } from 'react'
import { Send, Loader2, CheckCircle2 } from 'lucide-react'
import site from '../../data/site.json'

const TOPICS = [
  'Joining the chapter',
  'Collaboration or partnership',
  'A question',
  'Something else',
]

const labelCls =
  'block font-mono text-xs font-semibold uppercase tracking-widest text-brand dark:text-brand-light mb-1.5'

export default function ContactForm() {
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'success' | 'error'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: 'Joining the chapter',
    message: '',
    botcheck: false,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (status === 'sending') return

    // Honeypot spam protection: if checked, pretend success and do not call the network
    if (formData.botcheck) {
      setStatus('success')
      return
    }

    const accessKey = site?.form?.accessKey?.trim() || ''
    const endpoint = site?.form?.endpoint || 'https://api.web3forms.com/submit'

    // If accessKey is empty or starts with "PASTE", do NOT call the network
    if (!accessKey || accessKey.startsWith('PASTE')) {
      setStatus('error')
      return
    }

    setStatus('sending')

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: accessKey,
          name: formData.name,
          email: formData.email,
          message: formData.message,
          topic: formData.topic,
          subject: `New message from the website: ${formData.topic}`,
          from_name: "CAS ENET'Com website",
          botcheck: false,
        }),
      })

      if (!response.ok) {
        setStatus('error')
        return
      }

      const data = await response.json()
      if (data && data.success === true) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      topic: 'Joining the chapter',
      message: '',
      botcheck: false,
    })
    setStatus('idle')
  }

  if (status === 'success') {
    return (
      <div
        aria-live="polite"
        className="min-h-[22rem] flex flex-col items-center justify-center text-center space-y-4 p-4"
      >
        <CheckCircle2 size={40} className="text-brand-light shrink-0" />
        <h3 className="text-2xl font-bold font-display">Message sent</h3>
        <p className="text-base opacity-90 leading-relaxed max-w-sm">
          Thank you. We will get back to you by email.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-ghost"
          >
            Send another message
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate={false}>
      {/* Hidden honeypot */}
      <input
        type="checkbox"
        name="botcheck"
        id="botcheck"
        tabIndex="-1"
        aria-hidden="true"
        autoComplete="off"
        checked={formData.botcheck}
        onChange={handleChange}
        style={{
          position: 'absolute',
          left: '-9999px',
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Row 1: Name and Email side by side on sm screens */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact-name" className={labelCls}>
            Your name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            className="field"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className={labelCls}>
            Your email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            className="field"
          />
        </div>
      </div>

      {/* Topic selection via chips */}
      <fieldset className="mt-4">
        <legend className={labelCls}>Topic</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <label key={t} className="cursor-pointer">
              <input
                type="radio"
                name="topic"
                value={t}
                checked={formData.topic === t}
                onChange={() => setFormData((prev) => ({ ...prev, topic: t }))}
                className="sr-only"
              />
              <span className="topic-chip">{t}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Message */}
      <div className="mt-4">
        <label htmlFor="contact-message" className={labelCls}>
          Your message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          required
          minLength={10}
          maxLength={2000}
          value={formData.message}
          onChange={handleChange}
          className="field resize-y"
        />
      </div>

      {/* Error message above bottom row */}
      {status === 'error' && (
        <div role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">
          Something went wrong. Please try again, or write to us directly at{' '}
          <a
            href={`mailto:${site.contact.email}`}
            className="underline font-medium hover:text-brand dark:hover:text-brand-light break-all"
          >
            {site.contact.email}
          </a>
        </div>
      )}

      {/* Bottom row */}
      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs opacity-70">
          Your message is sent by email to the chapter team.
        </p>
        <button
          type="submit"
          disabled={status === 'sending'}
          className="btn btn-primary w-full sm:w-auto"
        >
          {status === 'sending' ? (
            <>
              <Loader2 size={18} className="animate-spin motion-reduce:animate-none" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send size={18} />
              <span>Send message</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
```

---

## 3. Contact Page Structure (`src/pages/Contact.jsx`)

### Key Architecture & Logic
1. **Two-Column Grid**:
   - `lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14`.
   - Stacks below `lg` with "Find us" first, form second.
2. **`data-node` Constraint**:
   - Exactly two `data-node` attributes exist on the entire page:
     1. `<h1 data-node="Contact us" ...>`
     2. `<h2 data-node="Find us" ...>`
   - The right column heading (`Write to us`) explicitly has **no** `data-node` attribute so the background `CircuitBoard` animation does not branch across the left column.
3. **Single Glass Card Wrapper**:
   - Exactly one card wrapper (`<div data-glow className="card mt-4 p-6 sm:p-7">`) surrounds `<ContactForm />`, placed in `Contact.jsx`.
4. **Interactive Channel Tiles (Left Column)**:
   - **Email Tile**: Includes a copy button that calls `navigator.clipboard.writeText(...)` within try/catch, swapping `Copy` for `Check` for 1.8 seconds with screen-reader announcement. The button is separate from the email mailto anchor.
   - **Address Tile**: The entire tile is an anchor targeting Google Maps (`mapsUrl`).
   - **Socials Tile**: Three circle buttons linking to LinkedIn, Instagram, and Facebook.
   - All three tiles include `<span className="channel-trace" aria-hidden="true" />` which connect to the form card on large screens.

### Full Page Code:
```jsx
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
```

---

## 4. Verification & Build
- `npm run build` ran with zero errors or warnings.
- All form logic (idle, sending, success, error, honeypot, reset, access key guard) operates purely in client-side React with direct fetch to Web3Forms.

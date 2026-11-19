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

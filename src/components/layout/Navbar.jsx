import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, Sun, Moon } from 'lucide-react'
import cas from '../../assets/logos/cas-logo.png'

const links = [
  ['Home', '/'], ['About us', '/about'], ['Activities', '/activities'],
  ['Awards', '/awards'], ['Contact us', '/contact'],
]

function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    try { localStorage.setItem('theme', dark ? 'dark' : 'light') } catch (e) {}
  }, [dark])
  return [dark, setDark]
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [dark, setDark] = useTheme()
  const item = ({ isActive }) =>
    `rounded px-2 py-1 text-sm font-medium hover:text-brand ${isActive ? 'text-brand' : ''}`

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/90 backdrop-blur dark:border-paper/10 dark:bg-night/90">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img src={cas} alt="IEEE CASS ENET'Com Student Branch Chapter logo" className="h-10 w-10 rounded-full" />
          <span className="font-display text-lg font-bold">IEEE CASS ENET'Com SBC</span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {links.map(([label, to]) => <NavLink key={to} to={to} end={to === '/'} className={item}>{label}</NavLink>)}
        </nav>
        <div className="flex items-center gap-1">
          <button onClick={() => setDark(!dark)} className="hover-glow-icon rounded p-2" aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setOpen(!open)} className="hover-glow-icon rounded p-2 lg:hidden" aria-label="Toggle menu" aria-expanded={open}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="container-page flex flex-col gap-1 pb-4 lg:hidden" aria-label="Mobile">
          {links.map(([label, to]) => (
            <NavLink key={to} to={to} className={item} onClick={() => setOpen(false)}>{label}</NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}

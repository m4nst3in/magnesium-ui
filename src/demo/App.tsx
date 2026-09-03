import { useEffect, useRef, useState } from 'react'

import { Button, ToastProvider } from '../index'
import { FormsSection } from './sections/Forms'
import { FundamentalsSection } from './sections/Fundamentals'
import { NavigationSection } from './sections/Navigation'
import { OverlaysSection } from './sections/Overlays'

const CATEGORIES = [
  { id: 'fundamentals', nav: 'Components' },
  { id: 'forms', nav: 'Forms' },
  { id: 'navigation', nav: 'Navigation' },
  { id: 'overlays', nav: 'Overlays' },
] as const

type CategoryId = (typeof CATEGORIES)[number]['id']

const THEME_KEY = 'magnesium-theme'

function initialDark(): boolean {
  if (typeof window === 'undefined') return true
  const saved = window.localStorage.getItem(THEME_KEY)
  if (saved === 'dark') return true
  if (saved === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function App() {
  return (
    <ToastProvider>
      <Playground />
    </ToastProvider>
  )
}

function Playground() {
  const [dark, setDark] = useState(initialDark)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState<CategoryId>('fundamentals')
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    window.localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    document.body.style.overflow = ''
  }, [])

  // Live-filter demo cards by rendered text; collapse emptied categories.
  useEffect(() => {
    const main = mainRef.current
    if (!main) return
    const q = query.trim().toLowerCase()
    main.querySelectorAll('.bentoCard').forEach((card) => {
      const hit = q === '' || (card.textContent ?? '').toLowerCase().includes(q)
      ;(card as HTMLElement).hidden = !hit
    })
    main.querySelectorAll('.category').forEach((category) => {
      const visible = category.querySelector('.bentoCard:not([hidden])') !== null
      ;(category as HTMLElement).hidden = q !== '' && !visible
    })
    const empty = main.querySelector<HTMLElement>('[data-search-empty]')
    if (empty) empty.hidden = q === '' || main.querySelector('.category:not([hidden])') !== null
  }, [query])

  // Scrollspy: highlight the nav link of the category in view.
  useEffect(() => {
    const main = mainRef.current
    if (!main) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id as CategoryId)
        }
      },
      { rootMargin: '-30% 0px -60% 0px' }
    )
    main.querySelectorAll('.category').forEach((category) => observer.observe(category))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="page">
      <nav className="topNav">
        <div className="topNavLeft">
          <a className="topNavLogo" href="#">
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background: 'var(--ui-primary)',
                color: 'var(--ui-primary-fg)',
                display: 'grid',
                placeItems: 'center',
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              Mg
            </span>
            Magnesium
          </a>
          <div className="topNavLinks">
            {CATEGORIES.map((category) => (
              <a
                key={category.id}
                className={active === category.id ? 'topNavLink active' : 'topNavLink'}
                href={`#${category.id}`}
                aria-current={active === category.id ? 'location' : undefined}
              >
                {category.nav}
              </a>
            ))}
          </div>
        </div>
        <div className="topNavRight">
          <input
            className="topNavSearch"
            placeholder="Filter components..."
            aria-label="Filter components"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <a
            href="https://github.com/m4nst3in/magnesium-ui"
            target="_blank"
            rel="noreferrer"
            className="topNavLink"
            style={{ padding: '6px 8px' }}
            aria-label="GitHub"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDark((d) => !d)}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? 'Light' : 'Dark'}
          </Button>
        </div>
      </nav>

      <main
        ref={mainRef}
        className="main"
        style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}
      >
        <div id="fundamentals" className="category">
          <div className="categoryHeader">
            <h2>Fundamentals</h2>
            <p>Buttons, feedback, structure.</p>
          </div>
          <FundamentalsSection />
        </div>

        <div id="forms" className="category">
          <div className="categoryHeader">
            <h2>Forms</h2>
            <p>Inputs, controls.</p>
          </div>
          <FormsSection />
        </div>

        <div id="navigation" className="category">
          <div className="categoryHeader">
            <h2>Navigation</h2>
            <p>Tables, navigation.</p>
          </div>
          <NavigationSection />
        </div>

        <div id="overlays" className="category">
          <div className="categoryHeader">
            <h2>Overlays</h2>
            <p>Modals, drawers, command.</p>
          </div>
          <OverlaysSection />
        </div>

        <div data-search-empty hidden className="searchEmpty">
          <p>No components match &ldquo;{query.trim()}&rdquo;.</p>
          <Button variant="outline" size="sm" onClick={() => setQuery('')}>
            Clear search
          </Button>
        </div>
      </main>
    </div>
  )
}

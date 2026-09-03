import { useEffect, useState } from 'react'

import { Button, ToastProvider } from '../index'
import { FormsSection } from './sections/Forms'
import { FundamentalsSection } from './sections/Fundamentals'
import { NavigationSection } from './sections/Navigation'
import { OverlaysSection } from './sections/Overlays'

export function App() {
  return (
    <ToastProvider>
      <Playground />
    </ToastProvider>
  )
}

function Playground() {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }, [dark])

  useEffect(() => {
    document.body.style.overflow = ''
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
            <a className="topNavLink active" href="#fundamentals">
              Components
            </a>
            <a className="topNavLink" href="#forms">
              Forms
            </a>
            <a className="topNavLink" href="#navigation">
              Navigation
            </a>
            <a className="topNavLink" href="#overlays">
              Overlays
            </a>
          </div>
        </div>
        <div className="topNavRight">
          <input
            className="topNavSearch"
            placeholder="Search documentation..."
            aria-label="Search"
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
            aria-label="Toggle theme"
          >
            {dark ? '☀️' : '🌙'}
          </Button>
          <Button size="sm">+ New</Button>
        </div>
      </nav>

      <div className="layout">
        <nav className="sidebar" aria-label="Sections">
          <div className="navGroup">
            <a className="navLink" href="#fundamentals">
              Fundamentals
            </a>
            <a className="navLink" href="#forms">
              Forms
            </a>
            <a className="navLink" href="#navigation">
              Navigation
            </a>
            <a className="navLink" href="#overlays">
              Overlays
            </a>
          </div>
          <div className="navGroup" style={{ marginTop: 16 }}>
            <p className="sidebarTitle">Shortcuts</p>
            <div
              style={{
                display: 'flex',
                gap: 6,
                alignItems: 'center',
                fontSize: 12,
                color: 'var(--ui-muted)',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 20,
                  height: 20,
                  padding: '0 4px',
                  borderRadius: 6,
                  background: 'var(--ui-zinc-100)',
                  border: '1px solid var(--ui-zinc-200)',
                  fontSize: 11,
                  fontWeight: 500,
                }}
              >
                ⌘
              </span>
              <span>+</span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 20,
                  height: 20,
                  padding: '0 4px',
                  borderRadius: 6,
                  background: 'var(--ui-zinc-100)',
                  border: '1px solid var(--ui-zinc-200)',
                  fontSize: 11,
                  fontWeight: 500,
                }}
              >
                K
              </span>
              <span>command</span>
            </div>
          </div>
        </nav>

        <main className="main">
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
        </main>
      </div>
    </div>
  )
}

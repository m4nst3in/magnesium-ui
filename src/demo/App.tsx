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
  const [dark, setDark] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }, [dark])

  useEffect(() => {
    document.body.style.overflow = ''
  }, [])
  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Magnesium UI</h1>
          <p className="subtitle">@m4nst3in/magnesium-ui — lightweight UI kit</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setDark((d) => !d)}>
          {dark ? '☀️ Light' : '🌙 Dark'}
        </Button>
      </header>

      <div className="layout">
        <nav className="sidebar" aria-label="Sections">
          <div className="navGroup">
            <p className="sidebarTitle">Fundamentals</p>
            <a className="navLink" href="#fundamentals">
              Fundamentals
            </a>
          </div>
          <div className="navGroup">
            <p className="sidebarTitle">Forms</p>
            <a className="navLink" href="#forms">
              Forms
            </a>
          </div>
          <div className="navGroup">
            <p className="sidebarTitle">Navigation</p>
            <a className="navLink" href="#navigation">
              Navigation
            </a>
          </div>
          <div className="navGroup">
            <p className="sidebarTitle">Overlays</p>
            <a className="navLink" href="#overlays">
              Overlays
            </a>
          </div>
          <div className="navGroup" style={{ marginTop: 8 }}>
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
              <p>Visual primitives — buttons, feedback, structure and utilities.</p>
            </div>
            <FundamentalsSection />
          </div>

          <div id="forms" className="category">
            <div className="categoryHeader">
              <h2>Forms</h2>
              <p>Inputs and controls with validation, states and interactions.</p>
            </div>
            <FormsSection />
          </div>

          <div id="navigation" className="category">
            <div className="categoryHeader">
              <h2>Navigation</h2>
              <p>Structure, tables and navigation between views.</p>
            </div>
            <NavigationSection />
          </div>

          <div id="overlays" className="category">
            <div className="categoryHeader">
              <h2>Overlays</h2>
              <p>Floating layers — modals, menus, drawers and command palette.</p>
            </div>
            <OverlaysSection />
          </div>
        </main>
      </div>
    </div>
  )
}

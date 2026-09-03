import { useState } from 'react'

import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CopyButton,
  EmptyState,
  Progress,
  Skeleton,
  useToast,
} from '../../index'

export function FundamentalsSection() {
  const { toast } = useToast()
  const [simLoading, setSimLoading] = useState(false)

  return (
    <div className="bento">
      <div className="bentoCard span6">
        <section className="section" style={{ padding: 16 }}>
          <h2>Buttons</h2>
          <div className="row">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button
              loading={simLoading}
              onClick={() => {
                setSimLoading(true)
                window.setTimeout(() => setSimLoading(false), 2500)
              }}
            >
              {simLoading ? 'Loading…' : 'Simulate loading'}
            </Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="row">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </section>
      </div>

      <div className="bentoCard span6">
        <section className="section" style={{ padding: 16 }}>
          <h2>Badges</h2>
          <div className="row">
            <Badge>neutral</Badge>
            <Badge variant="brand">brand</Badge>
            <Badge variant="success">success</Badge>
            <Badge variant="warning">warning</Badge>
            <Badge variant="danger">danger</Badge>
          </div>
          <h2 style={{ marginTop: 16 }}>Avatar & Progress</h2>
          <div className="row">
            <Avatar fallback="LS" size="sm" />
            <Avatar fallback="MR" />
            <Avatar fallback="AN" size="lg" />
          </div>
          <div className="stack" style={{ maxWidth: 320, marginTop: 12 }}>
            <Progress value={30} aria-label="Upload" />
            <Progress value={70} aria-label="Processing" />
          </div>
        </section>
      </div>

      <div className="bentoCard span6">
        <section className="section" style={{ padding: 16 }}>
          <h2>Card</h2>
          <Card>
            <Card.Header>
              <Card.Title>Card title</Card.Title>
              <Card.Description>Optional card description.</Card.Description>
            </Card.Header>
            <Card.Content>Card content. Combine with any component.</Card.Content>
            <Card.Footer>
              <Button variant="ghost" size="sm">
                Cancel
              </Button>
              <Button size="sm">Confirm</Button>
            </Card.Footer>
          </Card>
        </section>
      </div>

      <div className="bentoCard span6">
        <section className="section" style={{ padding: 16 }}>
          <h2>Alerts</h2>
          <div className="stack">
            <Alert title="Info">This is an informational message.</Alert>
            <Alert variant="success" title="Success">
              Everything worked.
            </Alert>
            <Alert variant="warning" title="Warning">
              Please check the data.
            </Alert>
            <Alert variant="danger" title="Error">
              Something went wrong.
            </Alert>
          </div>
        </section>
      </div>

      <div className="bentoCard span6">
        <section className="section" style={{ padding: 16 }}>
          <h2>Skeleton</h2>
          <div className="stack">
            <Skeleton style={{ height: 14, width: '40%' }} />
            <Skeleton style={{ height: 12, width: '90%' }} />
            <Skeleton style={{ height: 12, width: '75%' }} />
          </div>
        </section>
      </div>

      <div className="bentoCard span6">
        <section className="section" style={{ padding: 16 }}>
          <h2>Empty State</h2>
          <EmptyState
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            }
            title="No results"
            description="Try adjusting filters or clearing search."
            action={
              <Button variant="outline" size="sm">
                Clear filters
              </Button>
            }
          />
        </section>
      </div>

      <div className="bentoCard span12">
        <section className="section" style={{ padding: 16 }}>
          <h2>CopyButton</h2>
          <div className="row" style={{ gap: 16 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: 10,
                borderRadius: 10,
                background: 'var(--ui-subtle)',
                border: '1px solid var(--ui-subtle-border)',
                flex: 1,
              }}
            >
              <code
                style={{
                  flex: 1,
                  fontSize: 13,
                  fontFamily: 'ui-monospace, monospace',
                  color: 'var(--ui-fg)',
                }}
              >
                npm i @m4nst3in/magnesium-ui
              </code>
              <CopyButton
                value="npm i @m4nst3in/magnesium-ui"
                aria-label="Copy command"
                onCopy={() => toast({ title: 'Copied!' })}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  fontSize: 13,
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: 'var(--ui-subtle)',
                  border: '1px solid var(--ui-subtle-border)',
                  fontFamily: 'ui-monospace, monospace',
                }}
              >
                sk_live_51Hx...3a9f
              </span>
              <CopyButton value="sk_live_51Hx...3a9f" aria-label="Copy API key" />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

import { useState } from 'react'

import {
  Accordion,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Collapsible,
  Pagination,
  Table,
  Tabs,
  useToast,
} from '../../index'
export function NavigationSection() {
  const { toast } = useToast()
  const [tab, setTab] = useState('general')
  const [page, setPage] = useState(3)

  return (
    <>
      <section className="section">
        <h2>Breadcrumb</h2>
        <Card>
          <Card.Content>
            <div className="stack" style={{ gap: 18 }}>
              <Breadcrumb>
                <Breadcrumb.List>
                  <Breadcrumb.Item>
                    <Breadcrumb.Link href="#" onClick={(e) => e.preventDefault()}>
                      Home
                    </Breadcrumb.Link>
                  </Breadcrumb.Item>
                  <Breadcrumb.Separator />
                  <Breadcrumb.Item>
                    <Breadcrumb.Link href="#" onClick={(e) => e.preventDefault()}>
                      Projects
                    </Breadcrumb.Link>
                  </Breadcrumb.Item>
                  <Breadcrumb.Separator />
                  <Breadcrumb.Item>
                    <Breadcrumb.Page>ui-kit</Breadcrumb.Page>
                  </Breadcrumb.Item>
                </Breadcrumb.List>
              </Breadcrumb>
              <Breadcrumb>
                <Breadcrumb.List>
                  <Breadcrumb.Item>
                    <Breadcrumb.Link href="#" onClick={(e) => e.preventDefault()}>
                      Dashboard
                    </Breadcrumb.Link>
                  </Breadcrumb.Item>
                  <Breadcrumb.Separator />
                  <Breadcrumb.Item>
                    <Breadcrumb.Ellipsis />
                  </Breadcrumb.Item>
                  <Breadcrumb.Separator />
                  <Breadcrumb.Item>
                    <Breadcrumb.Link href="#" onClick={(e) => e.preventDefault()}>
                      Billing
                    </Breadcrumb.Link>
                  </Breadcrumb.Item>
                  <Breadcrumb.Separator />
                  <Breadcrumb.Item>
                    <Breadcrumb.Page>March 2025</Breadcrumb.Page>
                  </Breadcrumb.Item>
                </Breadcrumb.List>
              </Breadcrumb>
            </div>
          </Card.Content>
        </Card>
      </section>

      <section className="section">
        <h2>Tabs</h2>
        <Tabs value={tab} onValueChange={setTab}>
          <Tabs.List>
            <Tabs.Trigger value="general">General</Tabs.Trigger>
            <Tabs.Trigger value="profile">Profile</Tabs.Trigger>
            <Tabs.Trigger value="notifications">Notifications</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Panel value="general">General tab content.</Tabs.Panel>
          <Tabs.Panel value="profile">Profile tab content.</Tabs.Panel>
          <Tabs.Panel value="notifications">Notifications tab content.</Tabs.Panel>
        </Tabs>
      </section>

      <section className="section">
        <h2>Pagination</h2>
        <Card>
          <Card.Content>
            <div className="stack" style={{ gap: 20, alignItems: 'center' }}>
              <Pagination page={page} total={12} onChange={setPage} />
              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  fontSize: 13,
                  color: 'var(--ui-muted)',
                }}
              >
                <span>
                  Page{' '}
                  <strong style={{ color: 'var(--ui-fg)', fontVariantNumeric: 'tabular-nums' }}>
                    {page}
                  </strong>{' '}
                  of 12
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(12, p + 1))}
                  disabled={page === 12}
                >
                  Next
                </Button>
              </div>
              <Pagination page={5} total={24} onChange={() => {}} siblingCount={2} />
              <p style={{ margin: 0, fontSize: 12, color: 'var(--ui-muted)' }}>
                Auto ellipsis with `siblingCount` — Prev/Next disable at edges.
              </p>
            </div>
          </Card.Content>
        </Card>
      </section>

      <section className="section">
        <h2>Table — Linear / shadcn</h2>
        <p
          className="subtitle"
          style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--ui-muted)' }}
        >
          Sticky header with blur, hover with accent, interactive rows + keyboard — click a row
        </p>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Th>File</Table.Th>
              <Table.Th numeric>Size</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Owner</Table.Th>
              <Table.Th style={{ width: 1, whiteSpace: 'nowrap' }} />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row
              interactive
              onClick={() => toast({ title: 'relatorio-q1.pdf', description: 'Opening file…' })}
            >
              <Table.Td>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: 8,
                      background: 'var(--ui-danger-soft)',
                      border: '1px solid transparent',
                      color: 'var(--ui-danger-text)',
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.35"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 1.4H9.6L13 4.8V13.1A1.3 1.3 0 0 1 11.7 14.4H5A1.3 1.3 0 0 1 3.7 13.1V2.7A1.3 1.3 0 0 1 5 1.4Z" />
                      <path d="M9.6 1.4V4.8H13" />
                      <path d="M5.7 7.6H10.3M5.7 9.9H10.3M5.7 12.1H8.4" />
                    </svg>
                  </span>
                  relatorio-q1.pdf
                </span>
              </Table.Td>
              <Table.Td numeric>2.4 MB</Table.Td>
              <Table.Td>
                <Badge variant="success">Ready</Badge>
              </Table.Td>
              <Table.Td>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Avatar fallback="LS" size="sm" />
                  lesce
                </span>
              </Table.Td>
              <Table.Td>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    toast({ title: 'Shared' })
                  }}
                >
                  Share
                </Button>
              </Table.Td>
            </Table.Row>
            <Table.Row
              interactive
              selected
              onClick={() => toast({ title: 'budget.xlsx', description: 'Selected' })}
            >
              <Table.Td>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: 8,
                      background: 'var(--ui-success-soft)',
                      border: '1px solid transparent',
                      color: 'var(--ui-success-text)',
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.35"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="2.7" y="1.6" width="10.6" height="12.4" rx="1.3" />
                      <path d="M2.7 5.2H13.3M2.7 8.4H13.3M6.2 5.2V14M9.8 5.2V14" />
                      <rect
                        x="3.7"
                        y="2.6"
                        width="2.5"
                        height="1.6"
                        rx="0.5"
                        fill="currentColor"
                        opacity="0.18"
                        stroke="none"
                      />
                    </svg>
                  </span>
                  budget.xlsx
                </span>
              </Table.Td>
              <Table.Td numeric>880 KB</Table.Td>
              <Table.Td>
                <Badge variant="warning">Processing</Badge>
              </Table.Td>
              <Table.Td>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Avatar fallback="MR" size="sm" />
                  marina
                </span>
              </Table.Td>
              <Table.Td>
                <Badge variant="brand">Selected</Badge>
              </Table.Td>
            </Table.Row>
            <Table.Row
              interactive
              onClick={() =>
                toast({ title: 'backup.zip', variant: 'danger', description: 'Failed to open' })
              }
            >
              <Table.Td>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: 8,
                      background: 'var(--ui-warning-soft)',
                      border: '1px solid transparent',
                      color: 'var(--ui-warning-text)',
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.35"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="3" y="3.2" width="10" height="9.2" rx="1.3" />
                      <path d="M3 6.6H13M5.2 6.6V12.4M10.8 6.6V12.4" />
                      <circle cx="8" cy="9.2" r="1.05" fill="currentColor" stroke="none" />
                      <path d="M8 10.25V11.1" strokeWidth="1.1" />
                    </svg>
                  </span>
                  backup.zip
                </span>
              </Table.Td>
              <Table.Td numeric>1.2 GB</Table.Td>
              <Table.Td>
                <Badge variant="danger">Failed</Badge>
              </Table.Td>
              <Table.Td>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Avatar fallback="AN" size="sm" />
                  ana
                </span>
              </Table.Td>
              <Table.Td>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    toast({ title: 'Retrying…' })
                  }}
                >
                  Retry
                </Button>
              </Table.Td>
            </Table.Row>
            <Table.Row>
              <Table.Td>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: 8,
                      background: 'color-mix(in srgb, #7c3aed 10%, var(--ui-surface))',
                      border: '1px solid color-mix(in srgb, #7c3aed 14%, transparent)',
                      color: '#7c3aed',
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.35"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="2.6" y="3.1" width="10.8" height="9.4" rx="1.3" />
                      <path
                        d="M6.1 5.9V10.3L9.9 8.1Z"
                        fill="currentColor"
                        stroke="none"
                        strokeLinejoin="round"
                      />
                      <path d="M2.6 6.2H13.4M2.6 9.8H13.4" opacity="0.22" />
                    </svg>
                  </span>
                  demo-linear.mp4
                </span>
              </Table.Td>
              <Table.Td numeric>342 MB</Table.Td>
              <Table.Td>
                <Badge>Archived</Badge>
              </Table.Td>
              <Table.Td>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Avatar fallback="JP" size="sm" />
                  joão
                </span>
              </Table.Td>
              <Table.Td style={{ color: 'var(--ui-muted)', fontSize: 12 }}>—</Table.Td>
            </Table.Row>
          </Table.Body>
          <Table.Caption>4 files · click interactive rows (keyboard Enter/Space)</Table.Caption>
        </Table>
      </section>

      <section className="section">
        <h2>Accordion & Collapsible</h2>
        <div
          className="grid"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}
        >
          <Card>
            <Card.Header>
              <Card.Title style={{ fontSize: 13 }}>Accordion single (collapsible)</Card.Title>
              <Card.Description>One at a time — Linear 10px radius, grid 0fr→1fr</Card.Description>
            </Card.Header>
            <Card.Content>
              <Accordion type="single" collapsible defaultValue="item-1">
                <Accordion.Item value="item-1">
                  <Accordion.Trigger>What is ui-kit?</Accordion.Trigger>
                  <Accordion.Content>
                    React + TS library with CSS tokens and Vercel/Linear style — zero runtime deps.
                  </Accordion.Content>
                </Accordion.Item>
                <Accordion.Item value="item-2">
                  <Accordion.Trigger>How to use dark theme?</Accordion.Trigger>
                  <Accordion.Content>
                    <code
                      style={{
                        fontSize: 12,
                        padding: '2px 6px',
                        borderRadius: 6,
                        background: 'var(--ui-subtle)',
                        border: '1px solid var(--ui-subtle-border)',
                      }}
                    >
                      document.documentElement.dataset.theme = &apos;dark&apos;
                    </code>
                  </Accordion.Content>
                </Accordion.Item>
                <Accordion.Item value="item-3">
                  <Accordion.Trigger>Can I control via value?</Accordion.Trigger>
                  <Accordion.Content>
                    Yes — `value`/`defaultValue` + `onValueChange`, `type=&quot;multiple&quot;`
                    allows multiple open.
                  </Accordion.Content>
                </Accordion.Item>
              </Accordion>
            </Card.Content>
          </Card>
          <Card>
            <Card.Header>
              <Card.Title style={{ fontSize: 13 }}>Collapsible primitive</Card.Title>
              <Card.Description>Pure primitive — no Accordion</Card.Description>
            </Card.Header>
            <Card.Content>
              <Collapsible defaultOpen>
                <Collapsible.Trigger>Show details</Collapsible.Trigger>
                <Collapsible.Content>
                  <div
                    style={{
                      paddingTop: 8,
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: 'var(--ui-muted)',
                    }}
                  >
                    Content with `grid 0fr→1fr` 260ms animation. Click again to collapse. Keyboard
                    Space/Enter works.
                  </div>
                </Collapsible.Content>
              </Collapsible>
              <div style={{ height: 12 }} />
              <Accordion type="multiple" defaultValue={['a']}>
                <Accordion.Item value="a">
                  <Accordion.Trigger>Multiple — A</Accordion.Trigger>
                  <Accordion.Content>
                    With `type=&quot;multiple&quot;` several items stay open.
                  </Accordion.Content>
                </Accordion.Item>
                <Accordion.Item value="b">
                  <Accordion.Trigger>Multiple — B</Accordion.Trigger>
                  <Accordion.Content>Another independent content.</Accordion.Content>
                </Accordion.Item>
              </Accordion>
            </Card.Content>
          </Card>
        </div>
      </section>
    </>
  )
}

import { useEffect, useState } from 'react'

import {
  Button,
  Card,
  Command,
  Drawer,
  Dropdown,
  FileIcon,
  Kbd,
  Modal,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  useToast,
} from '../../index'

export function OverlaysSection() {
  const { toast } = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerSide, setDrawerSide] = useState<'right' | 'left' | 'top' | 'bottom'>('right')
  const [cmdOpen, setCmdOpen] = useState(false)

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCmdOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  return (
    <div className="bento">
      <div className="bentoCard span6">
        <section className="section" style={{ padding: 16 }}>
          <h2>Tooltip & Dropdown</h2>
          <div className="row">
            <Tooltip content="Save changes (Ctrl+S)">
              <Button variant="outline" size="sm">
                Hover me
              </Button>
            </Tooltip>
            <Tooltip content="Available only on Pro plan" side="bottom">
              <Button variant="ghost" size="sm">
                Tooltip bottom
              </Button>
            </Tooltip>
            <Dropdown trigger={<Button variant="outline">Options ▾</Button>}>
              <Dropdown.Item>Duplicate</Dropdown.Item>
              <Dropdown.Item>Rename</Dropdown.Item>
              <Dropdown.Separator />
              <Dropdown.Item style={{ color: 'var(--ui-danger-text)' }}>Delete</Dropdown.Item>
            </Dropdown>
          </div>
        </section>
      </div>

      <div className="bentoCard span6">
        <section className="section" style={{ padding: 16 }}>
          <h2>Popover</h2>
          <div className="row">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  Open Popover
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" align="center" style={{ padding: 12, minWidth: 220 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>Popover title</p>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--ui-muted)' }}>
                  Side top, arrow, portal.
                </p>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm">
                  Bottom start
                </Button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="start" style={{ padding: 10, fontSize: 12 }}>
                Bottom start
              </PopoverContent>
            </Popover>
          </div>
        </section>
      </div>

      <div className="bentoCard span6">
        <section className="section" style={{ padding: 16 }}>
          <h2>Drawer / Sheet</h2>
          <div className="row" style={{ flexWrap: 'wrap' }}>
            {(['right', 'left', 'top', 'bottom'] as const).map((s) => (
              <Button
                key={s}
                variant="outline"
                size="sm"
                onClick={() => {
                  setDrawerSide(s)
                  setDrawerOpen(true)
                }}
              >
                Open {s}
              </Button>
            ))}
          </div>
          <Drawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            side={drawerSide}
            title={
              drawerSide === 'top' || drawerSide === 'bottom' ? 'Quick filters' : 'Edit project'
            }
            description={
              drawerSide === 'top' || drawerSide === 'bottom'
                ? 'Choose period or status'
                : 'Change data and save.'
            }
            footer={
              <>
                <Button variant="ghost" onClick={() => setDrawerOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setDrawerOpen(false)
                    toast({ title: 'Saved', variant: 'success' })
                  }}
                >
                  Save
                </Button>
              </>
            }
          >
            <div className="stack" style={{ gap: 12 }}>
              <p style={{ fontSize: 13, color: 'var(--ui-muted)', margin: 0 }}>
                Drawer — fluid spring 420ms.
              </p>
            </div>
          </Drawer>
        </section>
      </div>

      <div className="bentoCard span6">
        <section className="section" style={{ padding: 16 }}>
          <h2>Command</h2>
          <div className="row" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
            <Button variant="outline" onClick={() => setCmdOpen(true)}>
              Open Command
            </Button>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                color: 'var(--ui-muted)',
              }}
            >
              <Kbd>⌘</Kbd> + <Kbd>K</Kbd>
            </span>
          </div>
          <Command
            open={cmdOpen}
            onClose={() => setCmdOpen(false)}
            placeholder="Search project, file or action…"
          >
            <Command.List>
              <Command.Group heading="Suggestions">
                <Command.Item
                  value="create project"
                  onSelect={() => {
                    setCmdOpen(false)
                    toast({ title: 'Create project' })
                  }}
                >
                  Create new project
                </Command.Item>
                <Command.Item
                  value="go to dashboard"
                  onSelect={() => {
                    setCmdOpen(false)
                    toast({ title: 'Dashboard' })
                  }}
                >
                  Go to Dashboard
                </Command.Item>
              </Command.Group>
              <Command.Separator />
              <Command.Group heading="Recent files">
                <Command.Item
                  value="relatorio-q1.pdf"
                  onSelect={() => {
                    setCmdOpen(false)
                    toast({ title: 'relatorio-q1.pdf' })
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <FileIcon name="relatorio.pdf" size="sm" /> relatorio-q1.pdf
                  </span>
                </Command.Item>
                <Command.Item
                  value="budget.xlsx"
                  onSelect={() => {
                    setCmdOpen(false)
                    toast({ title: 'budget.xlsx' })
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <FileIcon name="budget.xlsx" size="sm" /> budget.xlsx
                  </span>
                </Command.Item>
              </Command.Group>
              <Command.Empty>No results.</Command.Empty>
            </Command.List>
          </Command>
        </section>
      </div>

      <div className="bentoCard span12">
        <section className="section" style={{ padding: 16 }}>
          <h2>Modal & Toast</h2>
          <div className="row">
            <Button variant="outline" onClick={() => setModalOpen(true)}>
              Open modal
            </Button>
            <Button
              variant="outline"
              onClick={() => toast({ title: 'Saved successfully', variant: 'success' })}
            >
              Success toast
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                toast({ title: 'Failed to save', description: 'Try again.', variant: 'danger' })
              }
            >
              Error toast
            </Button>
          </div>
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Confirm action"
            footer={
              <>
                <Button variant="ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setModalOpen(false)
                    toast({ title: 'Action confirmed', variant: 'success' })
                  }}
                >
                  Confirm
                </Button>
              </>
            }
          >
            This action cannot be undone.
          </Modal>
        </section>
      </div>
    </div>
  )
}

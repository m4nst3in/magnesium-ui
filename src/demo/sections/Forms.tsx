import { useState, useEffect } from 'react'
import { Badge, Button, Card, Checkbox, Combobox, DatePicker, FileDrop, FileIcon, Input, NumberField, RadioGroup, Select, Slider, Switch, Textarea } from '../../index'
import { useToast } from '../../index'

export function FormsSection() {
  const { toast } = useToast()
  const [terms, setTerms] = useState(false)
  const [notify, setNotify] = useState(true)
  const [volume, setVolume] = useState(46)
  const [price, setPrice] = useState<[number, number]>([240, 780])
  const [qty, setQty] = useState(3)
  const [dropped, setDropped] = useState<{ name: string; preview?: string; size: number }[]>([])

  useEffect(() => {
    return () => dropped.forEach((f) => f.preview && URL.revokeObjectURL(f.preview))
  }, [dropped])

  return (
    <>
      <section className="section">
        <h2>Form</h2>
        <div className="grid">
          <Input label="Name" placeholder="Your name" />
          <Input label="Email" placeholder="you@email.com" error="Invalid email" />
          <Select
            label="Plan"
            defaultValue="pro"
            options={[
              { value: 'free', label: 'Free' },
              { value: 'pro', label: 'Pro' },
              { value: 'team', label: 'Team' },
            ]}
          />
          <Combobox
            label="Country"
            searchPlaceholder="Search country…"
            defaultValue="br"
            options={[
              { value: 'br', label: 'Brazil' },
              { value: 'ar', label: 'Argentina' },
              { value: 'cl', label: 'Chile' },
              { value: 'pt', label: 'Portugal' },
              { value: 'us', label: 'United States' },
              { value: 'jp', label: 'Japan' },
            ]}
          />
          <DatePicker label="Delivery date" />
          <Textarea label="Message" placeholder="Write something…" />
        </div>
        <div className="row">
          <Checkbox label="I accept the terms" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
          <Checkbox label="Disabled" disabled />
          <span className="row" style={{ gap: 8 }}>
            <Switch checked={notify} onCheckedChange={setNotify} />
            <span style={{ fontSize: 14 }}>Notifications</span>
          </span>
        </div>
        <div className="grid">
          <RadioGroup
            label="Priority"
            defaultValue="media"
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]}
          />
        </div>
      </section>

      <section className="section">
        <h2>NumberField</h2>
        <Card>
          <Card.Content>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
              <NumberField label="Quantity" value={qty} onValueChange={setQty} min={0} max={10} step={1} hint="0–10, step 1" />
              <NumberField label="Price" defaultValue={49.9} min={0} max={999} step={0.5} formatOptions={{ style: 'currency', currency: 'BRL' }} hint="step 0.50, formats BRL" />
              <NumberField label="Disabled" defaultValue={2} disabled hint="No interaction" />
              <NumberField label="With error" defaultValue={150} max={100} error="Above maximum (100)" />
            </div>
            <p style={{ margin: '14px 0 0', fontSize: 12, color: 'var(--ui-muted)' }}>Controlled/uncontrolled, clamp + snap, stepper with hold, keyboard ↑↓ PgUp/Dn Home/End.</p>
          </Card.Content>
        </Card>
      </section>

      <section className="section">
        <h2>Slider</h2>
        <Card>
          <Card.Content>
            <div className="stack" style={{ gap: 24, maxWidth: 520 }}>
              <Slider
                label="Volume"
                value={volume}
                onValueChange={(value: number | [number, number]) => {
                  if (typeof value === 'number') setVolume(value)
                }}
                showValue
                hint="Drag, click track or use ← → Home/End · Shift accelerates"
              />
              <Slider
                label="Brightness"
                defaultValue={68}
                showValue
                formatValue={(v) => `${v}%`}
                hint="Uncontrolled · bubble on thumb hover"
              />
              <Slider
                label="Price range"
                value={price}
                onValueChange={(value: number | [number, number]) => {
                  if (Array.isArray(value)) setPrice(value)
                }}
                min={0}
                max={1000}
                step={10}
                showValue
                formatValue={(v) => `$${v}`}
                hint="Range — two thumbs (no crossing) · click track moves closest"
              />
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <Slider label="Disabled" defaultValue={30} disabled showValue />
                <Slider label="Limit" defaultValue={88} max={80} error="Above allowed limit" showValue />
              </div>
              <Slider defaultValue={50} step={5} hint="No label · step 5" />
            </div>
          </Card.Content>
        </Card>
      </section>

      <section className="section">
        <h2>FileDrop</h2>
        <Card>
          <Card.Content>
            <div className="stack" style={{ gap: 16 }}>
              <FileDrop
                accept=".pdf,.xlsx,.zip,.mp4,.jpg,.png,.webp"
                multiple
                onFiles={(files) => {
                  const next = files.map((f) => ({
                    name: f.name,
                    size: f.size,
                    preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
                  }))
                  setDropped((prev) => {
                    prev.forEach((p) => p.preview && URL.revokeObjectURL(p.preview))
                    return next
                  })
                  if (files.length) toast({ title: `${files.length} file(s)`, description: files.map((f) => f.name).join(', ') })
                }}
                hint="Drag images or click — auto preview for JPG/PNG/WebP"
              />
              {dropped.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {dropped.map((f) => (
                    <div
                      key={f.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 12px',
                        borderRadius: 10,
                        background: 'var(--ui-surface)',
                        border: '1px solid var(--ui-border)',
                        boxShadow: 'var(--ui-shadow-xs)',
                      }}
                    >
                      {f.preview ? (
                        <img
                          src={f.preview}
                          alt={f.name}
                          style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--ui-subtle-border)' }}
                        />
                      ) : (
                        <span style={{ width: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: 8, background: 'var(--ui-subtle)', border: '1px solid var(--ui-subtle-border)', flexShrink: 0 }}>
                          <FileIcon name={f.name} size="sm" />
                        </span>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--ui-muted)' }}>{(f.size / 1024).toFixed(1)} KB</div>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      dropped.forEach((p) => p.preview && URL.revokeObjectURL(p.preview))
                      setDropped([])
                    }}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>
          </Card.Content>
        </Card>
      </section>
    </>
  )
}

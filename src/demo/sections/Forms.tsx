import { useEffect, useState } from 'react'

import {
  Button,
  Calendar,
  Card,
  Checkbox,
  Combobox,
  DatePicker,
  FileDrop,
  FileIcon,
  Input,
  NumberField,
  RadioGroup,
  Select,
  Slider,
  Switch,
  Textarea,
  useToast,
} from '../../index'

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
    <div className="bento">
      <div className="bentoCard span8">
        <section className="section" style={{ padding: 16 }}>
          <h2>Form</h2>
          <div
            className="grid"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}
          >
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
        </section>
      </div>

      <div className="bentoCard span4">
        <section className="section" style={{ padding: 16 }}>
          <h2>NumberField</h2>
          <div className="stack" style={{ gap: 12 }}>
            <NumberField
              label="Quantity"
              value={qty}
              onValueChange={setQty}
              min={0}
              max={10}
              step={1}
            />
            <NumberField
              label="Price"
              defaultValue={49.9}
              min={0}
              max={999}
              step={0.5}
              formatOptions={{ style: 'currency', currency: 'BRL' }}
            />
          </div>
        </section>
      </div>

      <div className="bentoCard span12">
        <section className="section" style={{ padding: 16 }}>
          <h2>Controls</h2>
          <div
            className="grid"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}
          >
            <div className="stack">
              <Checkbox
                label="I accept the terms"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
              />
              <Checkbox label="Disabled" disabled />
            </div>
            <div className="stack">
              <span className="row" style={{ gap: 8 }}>
                <Switch checked={notify} onCheckedChange={setNotify} />
                <span style={{ fontSize: 14 }}>Notifications</span>
              </span>
              <span style={{ fontSize: 12, color: 'var(--ui-muted)' }}>
                Email and push updates.
              </span>
            </div>
            <RadioGroup
              label="Priority"
              defaultValue="medium"
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
              ]}
            />
          </div>
        </section>
      </div>

      <div className="bentoCard span6">
        <section className="section" style={{ padding: 16 }}>
          <h2>Slider</h2>
          <div className="stack" style={{ gap: 16 }}>
            <Slider
              label="Volume"
              value={volume}
              onValueChange={(v) => typeof v === 'number' && setVolume(v)}
              showValue
            />
            <Slider
              label="Price range"
              value={price}
              onValueChange={(v) => Array.isArray(v) && setPrice(v)}
              min={0}
              max={1000}
              step={10}
              showValue
              formatValue={(v) => `$${v}`}
            />
            <Slider label="Disabled" value={30} disabled />
          </div>
        </section>
      </div>

      <div className="bentoCard span6">
        <section className="section" style={{ padding: 16 }}>
          <h2>Calendar</h2>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Calendar onChange={(d) => d && toast({ title: d.toLocaleDateString() })} />
          </div>
        </section>
      </div>

      <div className="bentoCard span12">
        <section className="section" style={{ padding: 16 }}>
          <h2>FileDrop</h2>
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
              if (files.length)
                toast({
                  title: `${files.length} file(s)`,
                  description: files.map((f) => f.name).join(', '),
                })
            }}
            hint="Drop images"
          />
          {dropped.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
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
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 8,
                        objectFit: 'cover',
                        flexShrink: 0,
                        border: '1px solid var(--ui-subtle-border)',
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        width: 44,
                        height: 44,
                        display: 'grid',
                        placeItems: 'center',
                        borderRadius: 8,
                        background: 'var(--ui-subtle)',
                        border: '1px solid var(--ui-subtle-border)',
                        flexShrink: 0,
                      }}
                    >
                      <FileIcon name={f.name} size="sm" />
                    </span>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {f.name}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--ui-muted)' }}>
                      {(f.size / 1024).toFixed(1)} KB
                    </div>
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
        </section>
      </div>
    </div>
  )
}

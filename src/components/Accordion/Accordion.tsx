import {
  createContext,
  useContext,
  useId,
  useState,
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { cn } from '../../utils/cn'
import styles from './Accordion.module.css'

interface CollapsibleContextValue {
  open: boolean
  toggle: () => void
  contentId: string
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null)

function useCollapsible() {
  const ctx = useContext(CollapsibleContext)
  if (!ctx) throw new Error('Collapsible.* must be inside <Collapsible>')
  return ctx
}

export interface CollapsibleProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactNode
}

const CollapsibleRoot = forwardRef<HTMLDivElement, CollapsibleProps>(function CollapsibleRoot(
  { open: controlledOpen, defaultOpen = false, onOpenChange, className, children, ...rest },
  ref,
) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const contentId = useId()

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen

  const toggle = () => {
    const next = !open
    if (!isControlled) setInternalOpen(next)
    onOpenChange?.(next)
  }

  return (
    <CollapsibleContext.Provider value={{ open, toggle, contentId }}>
      <div ref={ref} className={cn(styles.collapsible, className)} {...rest}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  )
})

export interface CollapsibleTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

const CollapsibleTrigger = forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  function CollapsibleTrigger({ className, children, onClick, ...rest }, ref) {
    const { open, toggle, contentId } = useCollapsible()

    return (
      <button
        ref={ref}
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        className={cn(styles.trigger, className)}
        onClick={(e) => {
          onClick?.(e)
          if (!e.defaultPrevented) toggle()
        }}
        {...rest}
      >
        <span className={styles.triggerLabel}>{children}</span>
        <span className={styles.chevronWrap} aria-hidden="true">
          <svg
            width={12}
            height={12}
            viewBox="0 0 12 12"
            fill="none"
            className={cn(styles.chevron, open && styles.chevronOpen)}
          >
            <path
              d="M2.5 4.5L6 8l3.5-3.5"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
    )
  },
)

export interface CollapsibleContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

const CollapsibleContent = forwardRef<HTMLDivElement, CollapsibleContentProps>(
  function CollapsibleContent({ className, children, ...rest }, ref) {
    const { open, contentId } = useCollapsible()

    return (
      <div
        ref={ref}
        id={contentId}
        data-state={open ? 'open' : 'closed'}
        className={cn(styles.contentOuter, open && styles.contentOuterOpen, className)}
        {...rest}
      >
        <div className={styles.contentInner}>
          <div className={styles.contentBody}>{children}</div>
        </div>
      </div>
    )
  },
)

export const Collapsible = Object.assign(CollapsibleRoot, {
  Trigger: CollapsibleTrigger,
  Content: CollapsibleContent,
})

type AccordionType = 'single' | 'multiple'

interface AccordionContextValue {
  type: AccordionType
  collapsible: boolean
  openValues: string[]
  toggle: (value: string) => void
}

const AccordionContext = createContext<AccordionContextValue | null>(null)

function useAccordion() {
  const ctx = useContext(AccordionContext)
  if (!ctx) throw new Error('Accordion.* must be inside <Accordion>')
  return ctx
}

interface AccordionItemContextValue {
  value: string
  open: boolean
  toggle: () => void
  contentId: string
}

const AccordionItemContext = createContext<AccordionItemContextValue | null>(null)

function useAccordionItem() {
  const ctx = useContext(AccordionItemContext)
  if (!ctx) throw new Error('Accordion.Item.* must be inside <Accordion.Item>')
  return ctx
}

export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  type?: AccordionType
  collapsible?: boolean
  value?: string | string[]
  defaultValue?: string | string[]
  onValueChange?: (value: string | string[] | undefined) => void
  children: ReactNode
}

const AccordionRoot = forwardRef<HTMLDivElement, AccordionProps>(function AccordionRoot(
  {
    type = 'single',
    collapsible = false,
    value: controlledValue,
    defaultValue,
    onValueChange,
    className,
    children,
    ...rest
  },
  ref,
) {
  const isControlled = controlledValue !== undefined

  const [internalValue, setInternalValue] = useState<string | string[] | undefined>(() => {
    if (defaultValue !== undefined) return defaultValue
    return type === 'multiple' ? [] : undefined
  })

  const getOpenValues = (): string[] => {
    if (type === 'multiple') {
      const v = (isControlled ? controlledValue : internalValue) as string | string[] | undefined
      if (v === undefined) return []
      return Array.isArray(v) ? v : [v]
    }

    const raw = (isControlled ? controlledValue : internalValue) as string | string[] | undefined
    if (raw === undefined) return []
    if (Array.isArray(raw)) return raw[0] ? [raw[0]] : []
    return raw ? [raw] : []
  }

  const openValues = getOpenValues()

  const toggle = (itemValue: string) => {
    if (type === 'multiple') {
      const next = openValues.includes(itemValue)
        ? openValues.filter((v) => v !== itemValue)
        : [...openValues, itemValue]
      if (!isControlled) setInternalValue(next)
      onValueChange?.(next)
    } else {
      const isOpen = openValues.includes(itemValue)
      if (isOpen) {
        if (!collapsible) return
        if (!isControlled) setInternalValue(undefined)
        onValueChange?.(undefined)
      } else {
        if (!isControlled) setInternalValue(itemValue)
        onValueChange?.(itemValue)
      }
    }
  }

  return (
    <AccordionContext.Provider value={{ type, collapsible, openValues, toggle }}>
      <div ref={ref} className={cn(styles.accordion, className)} {...rest}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
})

export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string
  children: ReactNode
}

const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItem(
  { value, className, children, ...rest },
  ref,
) {
  const { openValues, toggle } = useAccordion()
  const open = openValues.includes(value)
  const contentId = useId()

  const handleToggle = () => toggle(value)

  return (
    <AccordionItemContext.Provider value={{ value, open, toggle: handleToggle, contentId }}>
      <div
        ref={ref}
        data-state={open ? 'open' : 'closed'}
        className={cn(styles.item, open && styles.itemOpen, className)}
        {...rest}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  )
})

export interface AccordionTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  function AccordionTrigger({ className, children, onClick, ...rest }, ref) {
    const { open, toggle, contentId } = useAccordionItem()

    return (
      <button
        ref={ref}
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        data-state={open ? 'open' : 'closed'}
        className={cn(styles.trigger, styles.accordionTrigger, className)}
        onClick={(e) => {
          onClick?.(e)
          if (!e.defaultPrevented) toggle()
        }}
        {...rest}
      >
        <span className={styles.triggerLabel}>{children}</span>
        <span className={styles.chevronWrap} aria-hidden="true">
          <svg
            width={12}
            height={12}
            viewBox="0 0 12 12"
            fill="none"
            className={cn(styles.chevron, open && styles.chevronOpen)}
          >
            <path
              d="M2.5 4.5L6 8l3.5-3.5"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
    )
  },
)

export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  function AccordionContent({ className, children, ...rest }, ref) {
    const { open, contentId } = useAccordionItem()

    return (
      <div
        ref={ref}
        id={contentId}
        data-state={open ? 'open' : 'closed'}
        className={cn(styles.contentOuter, open && styles.contentOuterOpen, className)}
        {...rest}
      >
        <div className={styles.contentInner}>
          <div className={styles.contentBody}>{children}</div>
        </div>
      </div>
    )
  },
)

export const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
})

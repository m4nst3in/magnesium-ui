import {
  type ButtonHTMLAttributes,
  cloneElement,
  createContext,
  forwardRef,
  type HTMLAttributes,
  isValidElement,
  type ReactElement,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { lockBodyScroll, unlockBodyScroll } from '../../utils/bodyScrollLock'
import { cn } from '../../utils/cn'
import styles from './Popover.module.css'

export type PopoverSide = 'top' | 'right' | 'bottom' | 'left'
export type PopoverAlign = 'start' | 'center' | 'end'

export interface PopoverProps {
  children: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  modal?: boolean
}

export interface PopoverTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  children?: ReactNode
}

export interface PopoverContentProps extends HTMLAttributes<HTMLDivElement> {
  side?: PopoverSide
  align?: PopoverAlign
  sideOffset?: number
  alignOffset?: number
  arrow?: boolean
  modal?: boolean
}

export interface PopoverArrowProps extends HTMLAttributes<HTMLDivElement> {
  side?: PopoverSide
}

type PopoverContextValue = {
  open: boolean
  onOpenChange: (open: boolean) => void
  triggerRef: React.MutableRefObject<HTMLElement | null>
  contentRef: React.MutableRefObject<HTMLDivElement | null>
  side: PopoverSide
  align: PopoverAlign
  sideOffset: number
  alignOffset: number
  arrow: boolean
  modal: boolean
  contentId: string
}

const PopoverContext = createContext<PopoverContextValue | null>(null)

function usePopoverContext(): PopoverContextValue {
  const ctx = useContext(PopoverContext)
  if (!ctx) {
    throw new Error('Popover components must be used within <Popover>')
  }
  return ctx
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

// ---------------------------------------------------------------------------
// Popover root
// ---------------------------------------------------------------------------
export function Popover({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  modal = false,
}: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? (controlledOpen as boolean) : uncontrolledOpen

  const triggerRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const autoId = useId()
  const contentId = `${autoId}-popover-content`

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange]
  )

  const value = useMemo<PopoverContextValue>(
    () => ({
      open,
      onOpenChange: handleOpenChange,
      triggerRef,
      contentRef,
      side: 'bottom',
      align: 'center',
      sideOffset: 8,
      alignOffset: 0,
      arrow: false,
      modal,
      contentId,
    }),
    [open, handleOpenChange, modal, contentId]
  )

  return <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>
}

// ---------------------------------------------------------------------------
// PopoverTrigger
// ---------------------------------------------------------------------------
export const PopoverTrigger = forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  function PopoverTrigger(props, forwardedRef) {
    const { children, onClick, asChild: _asChild, ...rest } = props
    const ctx = usePopoverContext()

    const setRefs = useCallback(
      (node: HTMLButtonElement | null) => {
        ctx.triggerRef.current = node as unknown as HTMLElement | null
        if (typeof forwardedRef === 'function') forwardedRef(node)
        else if (forwardedRef && typeof forwardedRef === 'object')
          (forwardedRef as React.MutableRefObject<HTMLButtonElement | null>).current = node
      },
      [ctx.triggerRef, forwardedRef]
    )

    const handleClick = useCallback(
      (e: ReactMouseEvent<HTMLButtonElement>) => {
        onClick?.(e)
        if (e.defaultPrevented) return
        ctx.onOpenChange(!ctx.open)
      },
      [ctx, onClick]
    )

    const triggerProps = {
      'aria-expanded': ctx.open,
      'aria-haspopup': 'dialog' as const,
      'aria-controls': ctx.contentId,
      'data-state': ctx.open ? ('open' as const) : ('closed' as const),
      onClick: handleClick,
      ...rest,
    }

    // If children is a single valid element, clone it so any element can act as trigger
    if (isValidElement(children)) {
      const child = children as ReactElement<{
        onClick?: (e: unknown) => void
        ref?: React.Ref<HTMLElement>
      }>
      const childRef = (child as unknown as { ref?: React.Ref<HTMLElement> }).ref

      const mergedRef = (node: HTMLElement | null) => {
        ctx.triggerRef.current = node
        setRefs(node as HTMLButtonElement | null)
        if (typeof childRef === 'function') childRef(node)
        else if (childRef && typeof childRef === 'object')
          (childRef as React.MutableRefObject<HTMLElement | null>).current = node
      }

      const childOnClick = (child.props as { onClick?: (e: ReactMouseEvent<HTMLElement>) => void })
        .onClick

      return cloneElement(child, {
        ...triggerProps,
        ref: mergedRef,
        onClick: (e: ReactMouseEvent<HTMLElement>) => {
          childOnClick?.(e)
          if ((e as unknown as { defaultPrevented: boolean }).defaultPrevented) return
          // call outer onClick + toggle
          onClick?.(e as unknown as ReactMouseEvent<HTMLButtonElement>)
          if ((e as unknown as { defaultPrevented: boolean }).defaultPrevented) return
          ctx.onOpenChange(!ctx.open)
        },
      } as unknown as Record<string, unknown>)
    }

    return (
      <button ref={setRefs} type="button" {...triggerProps}>
        {children}
      </button>
    )
  }
)
PopoverTrigger.displayName = 'PopoverTrigger'

// ---------------------------------------------------------------------------
// PopoverContent
// ---------------------------------------------------------------------------
export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  function PopoverContent(props, forwardedRef) {
    const {
      children,
      className,
      style,
      side = 'bottom',
      align = 'center',
      sideOffset = 8,
      alignOffset = 0,
      arrow = false,
      modal: contentModal,
      ...rest
    } = props

    const ctx = usePopoverContext()
    const innerRef = useRef<HTMLDivElement | null>(null)
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null)

    const isModal = contentModal ?? ctx.modal

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        innerRef.current = node
        ctx.contentRef.current = node
        if (typeof forwardedRef === 'function') forwardedRef(node)
        else if (forwardedRef && typeof forwardedRef === 'object')
          (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node
      },
      [ctx.contentRef, forwardedRef]
    )

    const updatePosition = useCallback(() => {
      const trigger = ctx.triggerRef.current
      const content = innerRef.current
      if (!trigger || !content) return

      const triggerRect = trigger.getBoundingClientRect()
      const contentRect = content.getBoundingClientRect()

      let top = 0
      let left = 0

      if (side === 'top') {
        top = triggerRect.top - contentRect.height - sideOffset
        if (align === 'start') left = triggerRect.left + alignOffset
        else if (align === 'center')
          left = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2 + alignOffset
        else left = triggerRect.right - contentRect.width - alignOffset
      } else if (side === 'bottom') {
        top = triggerRect.bottom + sideOffset
        if (align === 'start') left = triggerRect.left + alignOffset
        else if (align === 'center')
          left = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2 + alignOffset
        else left = triggerRect.right - contentRect.width - alignOffset
      } else if (side === 'left') {
        left = triggerRect.left - contentRect.width - sideOffset
        if (align === 'start') top = triggerRect.top + alignOffset
        else if (align === 'center')
          top = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2 + alignOffset
        else top = triggerRect.bottom - contentRect.height - alignOffset
      } else if (side === 'right') {
        left = triggerRect.right + sideOffset
        if (align === 'start') top = triggerRect.top + alignOffset
        else if (align === 'center')
          top = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2 + alignOffset
        else top = triggerRect.bottom - contentRect.height - alignOffset
      }

      // Keep within viewport with 8px padding (spec says max-height viewport -16)
      const PADDING = 8
      const vw = window.innerWidth
      const vh = window.innerHeight
      const maxLeft = vw - contentRect.width - PADDING
      const maxTop = vh - contentRect.height - PADDING
      left = Math.min(Math.max(PADDING, left), Math.max(PADDING, maxLeft))
      top = Math.min(Math.max(PADDING, top), Math.max(PADDING, maxTop))

      setPosition({ top, left })
    }, [side, align, sideOffset, alignOffset, ctx.triggerRef])

    // Position on open and on resize/scroll
    useLayoutEffect(() => {
      if (!ctx.open) return
      updatePosition()
      const onResize = () => updatePosition()
      const onScroll = () => updatePosition()

      window.addEventListener('resize', onResize)
      window.addEventListener('scroll', onScroll, true)
      // Visual viewport changes (mobile)
      window.visualViewport?.addEventListener('resize', onResize)
      window.visualViewport?.addEventListener('scroll', onScroll)

      return () => {
        window.removeEventListener('resize', onResize)
        window.removeEventListener('scroll', onScroll, true)
        window.visualViewport?.removeEventListener('resize', onResize)
        window.visualViewport?.removeEventListener('scroll', onScroll)
      }
    }, [ctx.open, updatePosition])

    // Also re-calc after content size changes (e.g. dynamic children)
    useLayoutEffect(() => {
      if (!ctx.open) return
      // Use double rAF to ensure layout is settled
      const id = requestAnimationFrame(() => updatePosition())
      return () => cancelAnimationFrame(id)
    }, [ctx.open, children, updatePosition])

    // Focus: first focusable or content itself
    useEffect(() => {
      if (!ctx.open) return
      const content = innerRef.current
      if (!content) return

      const focusables = content.querySelectorAll<HTMLElement>(FOCUSABLE)
      const first = focusables.length > 0 ? focusables[0] : null
      ;(first ?? content).focus()

      if (isModal) lockBodyScroll()

      return () => {
        if (isModal) unlockBodyScroll()
      }
    }, [ctx.open, isModal])

    // Esc + click outside
    useEffect(() => {
      if (!ctx.open) return

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.stopPropagation()
          ctx.onOpenChange(false)
          // return focus to trigger
          queueMicrotask(() => (ctx.triggerRef.current as HTMLElement | null)?.focus())
        }
      }

      const onMouseDown = (e: globalThis.MouseEvent) => {
        const target = e.target as Node | null
        const content = innerRef.current
        const trigger = ctx.triggerRef.current
        if (!target) return
        if (content && content.contains(target)) return
        if (trigger && trigger.contains(target)) return
        ctx.onOpenChange(false)
      }

      document.addEventListener('keydown', onKeyDown)
      document.addEventListener('mousedown', onMouseDown)

      return () => {
        document.removeEventListener('keydown', onKeyDown)
        document.removeEventListener('mousedown', onMouseDown)
      }
    }, [ctx])

    if (!ctx.open) return null
    if (typeof document === 'undefined') return null

    // Provide nested context so PopoverArrow can read effective side/align
    const nestedValue: PopoverContextValue = {
      ...ctx,
      side,
      align,
      sideOffset,
      alignOffset,
      arrow,
    }

    const contentNode = (
      <PopoverContext.Provider value={nestedValue}>
        <div
          ref={setRefs}
          id={ctx.contentId}
          role="dialog"
          aria-modal={isModal ? true : undefined}
          tabIndex={-1}
          data-state={ctx.open ? 'open' : 'closed'}
          data-side={side}
          data-align={align}
          className={cn(styles.content, className)}
          style={{
            top: position ? `${position.top}px` : '0px',
            left: position ? `${position.left}px` : '0px',
            maxHeight: 'calc(100vh - 16px)',
            visibility: position ? 'visible' : 'hidden',
            ...style,
          }}
          {...rest}
        >
          {children}
          {arrow ? <PopoverArrow side={side} /> : null}
        </div>
      </PopoverContext.Provider>
    )

    return createPortal(contentNode, document.body)
  }
)
PopoverContent.displayName = 'PopoverContent'

// ---------------------------------------------------------------------------
// PopoverArrow
// ---------------------------------------------------------------------------
export const PopoverArrow = forwardRef<HTMLDivElement, PopoverArrowProps>(
  function PopoverArrow(props, forwardedRef) {
    const { className, side: sideProp, ...rest } = props
    const ctx = (() => {
      try {
        return usePopoverContext()
      } catch {
        return null
      }
    })()

    const side = sideProp ?? ctx?.side ?? 'bottom'

    return (
      <div
        ref={forwardedRef}
        data-side={side}
        aria-hidden="true"
        className={cn(styles.arrow, className)}
        {...rest}
      />
    )
  }
)
PopoverArrow.displayName = 'PopoverArrow'

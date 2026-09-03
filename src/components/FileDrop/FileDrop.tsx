import { useId, useRef, useState, type ReactNode, type DragEvent, type KeyboardEvent } from 'react'
import { cn } from '../../utils/cn'
import styles from './FileDrop.module.css'

export type FileIconSize = 'sm' | 'md'

export interface FileIconProps {
  name?: string
  type?: string
  size?: FileIconSize
  className?: string
}

type IconVariant = 'doc' | 'grid' | 'box' | 'film' | 'generic'

function detectVariant(name?: string, mime?: string): IconVariant {
  const raw = (mime ?? name ?? '').toLowerCase()

  if (mime) {
    const m = mime.toLowerCase()
    if (m.startsWith('image/')) return 'film'
    if (m.startsWith('video/') || m.startsWith('audio/')) return 'film'
    if (m.includes('pdf') || m.includes('msword') || m.includes('officedocument.word') || m.includes('text/')) {
      return 'doc'
    }
    if (m.includes('spreadsheet') || m.includes('excel') || m.includes('csv')) return 'grid'
    if (m.includes('zip') || m.includes('compressed') || m.includes('tar') || m.includes('gzip')) return 'box'
  }

  const ext = (() => {
    if (!name) return ''
    const base = name.split('/').pop() ?? name
    const dot = base.lastIndexOf('.')
    if (dot === -1) return ''
    return base.slice(dot + 1).toLowerCase()
  })()

  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'heic', 'heif', 'avif', 'tiff'].includes(ext)) {
    return 'film'
  }

  if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v', 'mp3', 'wav', 'flac', 'aac', 'ogg'].includes(ext)) {
    return 'film'
  }

  if (['xlsx', 'xls', 'csv', 'ods', 'numbers'].includes(ext)) {
    return 'grid'
  }

  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'tgz'].includes(ext)) {
    return 'box'
  }

  if (['pdf', 'doc', 'docx', 'txt', 'md', 'rtf', 'odt', 'ppt', 'pptx', 'key'].includes(ext)) {
    return 'doc'
  }

  if (ext) {

    return 'generic'
  }

  if (raw.includes('pdf')) return 'doc'
  if (raw.includes('sheet') || raw.includes('csv') || raw.includes('xls')) return 'grid'
  if (raw.includes('zip') || raw.includes('rar') || raw.includes('tar')) return 'box'
  if (raw.includes('mp4') || raw.includes('video') || raw.includes('audio') || raw.includes('image') || raw.includes('png') || raw.includes('jpg') || raw.includes('jpeg')) {
    return 'film'
  }

  return 'generic'
}

export function FileIcon({ name, type, size = 'md', className }: FileIconProps) {
  const variant = detectVariant(name, type)

  const variantClass =
    variant === 'doc'
      ? styles.variantDoc
      : variant === 'grid'
        ? styles.variantGrid
        : variant === 'box'
          ? styles.variantBox
          : variant === 'film'
            ? styles.variantFilm
            : styles.variantGeneric

  return (
    <span
      className={cn(styles.icon, size === 'sm' && styles.iconSm, variantClass, className)}
      aria-hidden="true"
    >
      {variant === 'doc' || variant === 'generic' ? (
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
      ) : variant === 'grid' ? (
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
          <rect x="3.7" y="2.6" width="2.5" height="1.6" rx="0.5" fill="currentColor" opacity="0.18" stroke="none" />
        </svg>
      ) : variant === 'box' ? (
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
      ) : (
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
          <path d="M6.1 5.9V10.3L9.9 8.1Z" fill="currentColor" stroke="none" strokeLinejoin="round" />
          <path d="M2.6 6.2H13.4M2.6 9.8H13.4" opacity="0.22" />
        </svg>
      )}
    </span>
  )
}

export interface FileDropProps {
  onFiles?: (files: File[]) => void
  accept?: string
  multiple?: boolean
  maxFiles?: number
  hint?: string
  error?: string
  disabled?: boolean
  children?: ReactNode
  className?: string
  id?: string
}

export function FileDrop({
  onFiles,
  accept,
  multiple,
  maxFiles,
  hint,
  error,
  disabled,
  children,
  className,
  id,
}: FileDropProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const messageId = error || hint ? `${inputId}-msg` : undefined

  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const dragCounter = useRef(0)

  const emitFiles = (fileList: FileList | File[]) => {
    const files = Array.from(fileList)
    if (files.length === 0) return
    const limited = typeof maxFiles === 'number' ? files.slice(0, maxFiles) : files

    const result = multiple === false ? limited.slice(0, 1) : limited
    onFiles?.(result)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return
    const list = e.target.files
    if (list) emitFiles(list)

    e.target.value = ''
  }

  const openPicker = () => {
    if (disabled) return
    inputRef.current?.click()
  }

  const handleClick = () => {
    openPicker()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openPicker()
    }
  }

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    if (disabled) return
    e.preventDefault()
    dragCounter.current += 1
    setDragOver(true)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (disabled) return
    e.preventDefault()

    e.dataTransfer.dropEffect = 'copy'
    if (!dragOver) setDragOver(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    if (disabled) return
    e.preventDefault()
    dragCounter.current -= 1
    if (dragCounter.current <= 0) {
      dragCounter.current = 0
      setDragOver(false)
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    if (disabled) return
    e.preventDefault()
    dragCounter.current = 0
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      emitFiles(files)
    }
  }

  return (
    <div className={cn(styles.wrapper, className)}>
      <input
        ref={inputRef}
        id={`${inputId}-input`}
        type="file"
        className={styles.inputHidden}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleInputChange}
        tabIndex={-1}
        aria-hidden="true"
      />
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload files"
        aria-disabled={disabled ? true : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={messageId}
        className={cn(styles.dropzone, dragOver && styles.dragOver, disabled && styles.disabled, error && styles.invalid)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {children ?? (
          <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 36,
                height: 36,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 10,
                background: 'var(--ui-surface)',
                border: '1px solid var(--ui-border)',
                color: 'var(--ui-muted)',
              }}
              aria-hidden="true"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 16V3" />
                <path d="M8 7L12 3L16 7" />
                <path d="M3 17V19A2 2 0 0 0 5 21H19A2 2 0 0 0 21 19V17" />
              </svg>
            </span>
            <span>
              <span style={{ color: 'var(--ui-fg)', fontWeight: 500 }}>Click to upload</span>
              <span style={{ color: 'var(--ui-muted)' }}> or drag and drop</span>
            </span>
          </span>
        )}
      </div>
      {error ? (
        <p id={messageId} className={styles.error}>
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}

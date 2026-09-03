let count = 0
let prev = ''

export function lockBodyScroll() {
  if (count === 0) {
    prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  count++
}

export function unlockBodyScroll() {
  count = Math.max(0, count - 1)
  if (count === 0) {
    document.body.style.overflow = prev
    prev = ''
  }
}

export function resetBodyScroll() {
  count = 0
  prev = ''
  document.body.style.overflow = ''
}

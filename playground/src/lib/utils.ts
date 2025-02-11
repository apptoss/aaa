import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(addr: string) {
  if (!addr) return ''
  const start = addr.slice(0, 7)
  const end = addr.slice(-6)
  return `${start}...${end}`
}

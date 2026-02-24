'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'

import { useRouter } from 'next/navigation'

import type { DashboardRole } from '@/lib/dashboardRole'
import { flattenVisibleNavItems } from '@/lib/dashboard/nav'

type Props = {
  role: DashboardRole
  isOpen: boolean
  onClose: () => void
}

function useMounted() {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  return mounted
}

export function DashboardSpotlight({ role, isOpen, onClose }: Props) {
  const mounted = useMounted()
  const router = useRouter()

  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const [query, setQuery] = React.useState('')
  const [activeIndex, setActiveIndex] = React.useState(0)

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = flattenVisibleNavItems(role)

    if (!q) return base

    return base
      .map((item) => {
        const hay = `${item.label} ${item.note ?? ''}`.toLowerCase()
        const score = hay.includes(q) ? (hay.startsWith(q) ? 2 : 1) : 0
        return { item, score }
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.item)
  }, [query, role])

  React.useEffect(() => {
    if (!isOpen) return
    setQuery('')
    setActiveIndex(0)

    const t = window.setTimeout(() => inputRef.current?.focus(), 0)
    return () => window.clearTimeout(t)
  }, [isOpen])

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === 'k'
      const openCombo = (e.metaKey || e.ctrlKey) && isK

      if (openCombo) {
        e.preventDefault()
        if (!isOpen) {
          // handled by parent listener
          return
        }
      }

      if (!isOpen) return

      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((v) => Math.min(v + 1, Math.max(results.length - 1, 0)))
        return
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((v) => Math.max(v - 1, 0))
        return
      }

      if (e.key === 'Enter') {
        const target = results[activeIndex]
        if (!target) return
        e.preventDefault()
        router.push(target.href)
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeIndex, isOpen, onClose, results, router])

  if (!mounted || !isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pb-10 pt-24 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Recherche dashboard"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-[color:var(--ui-border)] bg-[color:var(--ui-bg)] shadow-[var(--ui-shadow-md)]">
        <div className="border-b border-[color:var(--ui-border)] px-5 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.52em] text-[color:var(--ui-muted-2)]">
            Spotlight
          </p>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveIndex(0)
            }}
            placeholder="Tape un module (ex: licences, planning, rapports…)"
            className="mt-3 w-full rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)] px-4 py-3 text-base text-[color:var(--ui-fg)] outline-none placeholder:text-[color:var(--ui-muted-2)] focus:ring-2 focus:ring-[color:var(--ui-ring)]"
          />
          <p className="mt-2 text-xs text-[color:var(--ui-muted-2)]">
            Entrée pour ouvrir • ↑/↓ pour naviguer • Échap pour fermer
          </p>
        </div>

        <div className="max-h-[55vh] overflow-auto p-2">
          {results.length === 0 ? (
            <div className="p-6">
              <p className="text-sm font-semibold text-[color:var(--ui-fg)]">Aucun résultat.</p>
              <p className="mt-1 text-xs text-[color:var(--ui-muted)]">
                Essaye avec un autre mot-clé.
              </p>
            </div>
          ) : (
            <ul className="grid gap-1">
              {results.map((item, idx) => {
                const active = idx === activeIndex
                return (
                  <li key={item.href}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => {
                        router.push(item.href)
                        onClose()
                      }}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ui-ring)] ${
                        active
                          ? 'border-[color:var(--ui-border)] bg-[color:var(--ui-surface-2)]'
                          : 'border-transparent bg-transparent hover:bg-[color:var(--ui-surface)]'
                      }`}
                    >
                      <p className="font-semibold text-[color:var(--ui-fg)]">{item.label}</p>
                      {item.note ? (
                        <p className="mt-1 text-xs text-[color:var(--ui-muted)]">{item.note}</p>
                      ) : null}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

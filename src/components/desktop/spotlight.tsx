'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Search, X } from 'lucide-react'
import { appRegistry } from '@/config/app-registry'
import type { AppId } from '@/types/window'
import { AppIcon } from './app-icon'

interface SpotlightProps {
  isOpen: boolean
  onClose: () => void
  onLaunchApp: (appId: AppId) => void
}

export function Spotlight({ isOpen, onClose, onLaunchApp }: SpotlightProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([])
  // Tracks selection changes that originate from the keyboard so we only
  // scroll-into-view for arrow keys — not for mouse-driven highlight changes.
  const keyboardNavRef = useRef(false)

  const filtered = query.trim()
    ? appRegistry.filter(
        (app) =>
          app.name.toLowerCase().includes(query.toLowerCase()) ||
          app.description.toLowerCase().includes(query.toLowerCase())
      )
    : appRegistry

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      keyboardNavRef.current = false
      // Focus input after animation
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }
  }, [isOpen])

  // Keep selectedIndex in bounds when filter changes
  useEffect(() => {
    setSelectedIndex(0)
    keyboardNavRef.current = false
  }, [query])

  // Scroll the active row into view, but only when navigation came from the
  // keyboard (so a stationary cursor / mouse highlight never yanks the list).
  useEffect(() => {
    if (!keyboardNavRef.current) return
    keyboardNavRef.current = false
    rowRefs.current[selectedIndex]?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  const handleSelect = useCallback(
    (appId: AppId) => {
      onLaunchApp(appId)
      onClose()
    },
    [onLaunchApp, onClose]
  )

  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        keyboardNavRef.current = true
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        keyboardNavRef.current = true
        setSelectedIndex((i) => Math.max(i - 1, 0))
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        const app = filtered[selectedIndex]
        if (app) handleSelect(app.id)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filtered, selectedIndex, onClose, handleSelect])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="spotlight-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-spotlight-backdrop bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Search panel */}
          <motion.div
            key="spotlight-panel"
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="glass-panel fixed z-spotlight top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] max-w-[90vw] rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-white/8">
              <Search size={18} className="text-white/45 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search apps & more..."
                className="flex-1 bg-transparent text-white text-lg placeholder:text-white/30 outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="text-white/40 hover:text-white/70 transition-colors flex-shrink-0"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Results */}
            <div className="py-2 max-h-80 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-4 py-6 text-center text-white/30 text-sm">No results</div>
              ) : (
                filtered.map((app, i) => {
                  const isSelected = i === selectedIndex
                  return (
                    <button
                      key={app.id}
                      ref={(el) => {
                        rowRefs.current[i] = el
                      }}
                      onClick={() => handleSelect(app.id)}
                      // Use onMouseMove (not onMouseEnter) so a stationary
                      // cursor never hijacks arrow-key navigation.
                      onMouseMove={() => {
                        if (!isSelected) setSelectedIndex(i)
                      }}
                      className={[
                        'flex items-center gap-3 mx-2 w-[calc(100%-1rem)] px-2.5 py-2 text-left rounded-[10px] transition-colors',
                        isSelected ? 'bg-[#0a84ff]' : 'hover:bg-white/5',
                      ].join(' ')}
                    >
                      <AppIcon app={app} size={34} radius={9} className="flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{app.name}</p>
                        <p
                          className={[
                            'text-xs truncate',
                            isSelected ? 'text-white/70' : 'text-white/40',
                          ].join(' ')}
                        >
                          {app.description}
                        </p>
                      </div>
                      {isSelected && (
                        <span className="text-white/70 text-xs flex-shrink-0 pr-1">↵</span>
                      )}
                    </button>
                  )
                })
              )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2 border-t border-white/8 flex items-center gap-4 text-white/25 text-xs">
              <span>↑↓ navigate</span>
              <span>↵ open</span>
              <span>esc close</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

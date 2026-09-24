"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  EMPTY_FILTERS,
  countActiveFilters,
  type RunFilters,
} from "@/lib/test-data"
import { SlidersHorizontal, X } from "lucide-react"

type Props = {
  filters: RunFilters
  envOptions: string[]
  buildOptions: string[]
  onApply: (filters: RunFilters) => void
}

export function RunFilter({ filters, envOptions, buildOptions, onApply }: Props) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<RunFilters>(filters)
  const ref = useRef<HTMLDivElement>(null)

  const activeCount = countActiveFilters(filters)

  // Sync the draft with applied filters whenever the panel opens.
  useEffect(() => {
    if (open) setDraft(filters)
  }, [open, filters])

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  function apply() {
    onApply(draft)
    setOpen(false)
  }

  function clearAll() {
    setDraft(EMPTY_FILTERS)
    onApply(EMPTY_FILTERS)
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <SlidersHorizontal className="size-4" />
        Filter
        {activeCount > 0 && (
          <span className="ml-0.5 inline-flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
            {activeCount}
          </span>
        )}
      </Button>

      {open && (
        <div
          role="dialog"
          aria-label="Filter runs"
          className="absolute right-0 z-20 mt-2 w-80 origin-top-right rounded-xl border border-border bg-popover p-4 shadow-lg"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Filters</h3>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close filters"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Date range */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Date range (created)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={draft.from}
                  max={draft.to || undefined}
                  onChange={(e) => setDraft({ ...draft, from: e.target.value })}
                  className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
                <span className="text-xs text-muted-foreground">to</span>
                <input
                  type="date"
                  value={draft.to}
                  min={draft.from || undefined}
                  onChange={(e) => setDraft({ ...draft, to: e.target.value })}
                  className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </div>

            {/* Environment */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Environment
              </label>
              <div className="flex flex-wrap gap-1.5">
                {["All", ...envOptions].map((env) => (
                  <button
                    key={env}
                    onClick={() => setDraft({ ...draft, env })}
                    className={cn(
                      "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                      draft.env === env
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {env}
                  </button>
                ))}
              </div>
            </div>

            {/* Build */}
            <div>
              <label
                htmlFor="build-select"
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
              >
                Build
              </label>
              <select
                id="build-select"
                value={draft.build}
                onChange={(e) => setDraft({ ...draft, build: e.target.value })}
                className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
              >
                <option value="All">All builds</option>
                {buildOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear all
            </Button>
            <Button size="sm" onClick={apply}>
              Apply filters
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

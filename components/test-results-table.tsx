"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/progress-bar"
import { RunFilter } from "@/components/run-filter"
import {
  queryRuns,
  deriveFilterOptions,
  formatDate,
  EMPTY_FILTERS,
  type RunFilters,
  type TestRun,
} from "@/lib/test-data"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

const PAGE_SIZE = 10

type Props = {
  runs: TestRun[]
  loading?: boolean
}

export function TestResultsTable({ runs, loading = false }: Props) {
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<RunFilters>(EMPTY_FILTERS)
  const [page, setPage] = useState(0)

  const { envs, builds } = useMemo(() => deriveFilterOptions(runs), [runs])

  const filtered = useMemo(
    () => queryRuns(runs, filters, query),
    [runs, query, filters],
  )

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pageCount - 1)
  const rows = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE)

  const start = filtered.length === 0 ? 0 : current * PAGE_SIZE + 1
  const end = Math.min(filtered.length, current * PAGE_SIZE + PAGE_SIZE)

  function resetPage<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v)
      setPage(0)
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => resetPage(setQuery)(e.target.value)}
            placeholder="Search by name or run ID"
            className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>

        <RunFilter
          filters={filters}
          envOptions={envs}
          buildOptions={builds}
          onApply={(f) => {
            setFilters(f)
            setPage(0)
          }}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Run ID</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Env</th>
              <th className="px-4 py-3 font-medium">Build</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Progress</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="border-b border-border/60 last:border-0">
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-4 py-3.5">
                      <div className="h-4 w-full max-w-32 animate-pulse rounded bg-muted" />
                    </td>
                  ))}
                </tr>
              ))}
            {!loading &&
              rows.map((run) => (
              <tr
                key={run.id}
                className="group border-b border-border/60 transition-colors last:border-0 hover:bg-muted/50"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/runs/${run.id}`}
                    className="font-mono text-xs font-semibold text-primary underline-offset-4 transition-colors hover:underline focus-visible:underline focus-visible:outline-none"
                  >
                    #{run.id}
                  </Link>
                </td>
                <td className="px-4 py-3 font-medium text-foreground">
                  {run.name}
                </td>
                <td className="px-4 py-3">
                  <EnvBadge env={run.env} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-muted-foreground">
                  {run.build}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {formatDate(run.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <ProgressBar run={run} />
                </td>
              </tr>
              ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-16 text-center text-sm text-muted-foreground"
                >
                  No test runs match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-medium text-foreground">{start}</span>–
          <span className="font-medium text-foreground">{end}</span> of{" "}
          <span className="font-medium text-foreground">{filtered.length}</span>{" "}
          runs
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={current === 0}
          >
            <ChevronLeft className="size-4" />
            Prev
          </Button>
          <span className="px-1 text-xs text-muted-foreground tabular-nums">
            {current + 1} / {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={current >= pageCount - 1}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

const ENV_STYLES: Record<string, string> = {
  Production: "bg-fail/10 text-fail",
  Staging: "bg-blocked/10 text-blocked",
  QA: "bg-primary/10 text-primary",
  Dev: "bg-muted text-muted-foreground",
}

function EnvBadge({ env }: { env: string }) {
  if (env === "—") {
    return <span className="text-muted-foreground">—</span>
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        ENV_STYLES[env] ?? "bg-secondary text-secondary-foreground",
      )}
    >
      {env}
    </span>
  )
}

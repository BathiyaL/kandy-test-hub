"use client"

import useSWR from "swr"
import { useMemo } from "react"
import { AlertCircle } from "lucide-react"
import { TestResultsTable } from "@/components/test-results-table"
import { mapSummaries, type TestRunSummary } from "@/lib/test-data"

const fetcher = async (url: string): Promise<TestRunSummary[]> => {
  const res = await fetch(url)
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Request failed with status ${res.status}`)
  }
  return res.json()
}

function Stat({
  label,
  value,
  hint,
  loading,
}: {
  label: string
  value: string
  hint?: string
  loading?: boolean
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {loading ? (
        <div className="mt-2 h-7 w-16 animate-pulse rounded bg-muted" />
      ) : (
        <p className="mt-1.5 text-2xl font-semibold tabular-nums text-foreground">
          {value}
        </p>
      )}
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function TestResultsView() {
  const { data, error, isLoading } = useSWR<TestRunSummary[]>(
    "/api/test-runs",
    fetcher,
  )

  const runs = useMemo(() => (data ? mapSummaries(data) : []), [data])

  const totals = useMemo(() => {
    return runs.reduce(
      (acc, r) => {
        acc.passed += r.passed
        acc.failed += r.failed
        acc.skipped += r.skipped
        return acc
      },
      { passed: 0, failed: 0, skipped: 0 },
    )
  }, [runs])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          label="Total Runs"
          value={String(runs.length)}
          hint="From API"
          loading={isLoading}
        />
        <Stat
          label="Passed"
          value={String(totals.passed)}
          hint="Across all runs"
          loading={isLoading}
        />
        <Stat
          label="Failed"
          value={String(totals.failed)}
          hint="Across all runs"
          loading={isLoading}
        />
        <Stat
          label="Skipped"
          value={String(totals.skipped)}
          hint="Across all runs"
          loading={isLoading}
        />
      </div>

      {error ? (
        <div className="flex items-center gap-3 rounded-xl border border-fail/30 bg-fail/5 p-4 text-sm text-fail">
          <AlertCircle className="size-5 shrink-0" />
          <div>
            <p className="font-medium">Couldn&apos;t load test runs</p>
            <p className="text-fail/80">
              {error.message}
            </p>
          </div>
        </div>
      ) : (
        <TestResultsTable runs={runs} loading={isLoading} />
      )}
    </div>
  )
}

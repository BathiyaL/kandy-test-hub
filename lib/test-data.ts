export type RunStatus = "Initiated" | "Completed"

export type TestRun = {
  id: number
  name: string
  env: string
  build: string
  source: string
  executedUser: string
  createdAt: string
  status: RunStatus
  total: number
  passed: number
  failed: number
  skipped: number
}

// Raw shape returned by the TestRunsSummary REST endpoint.
export type TestRunSummary = {
  testRunId: number
  name: string | null
  systemUnderTest: string | null
  buildVersion: string | null
  executedAt: string | null
  totalPassed: number | null
  totalFailed: number | null
  totalSkipped: number | null
  source: string | null
  executedUser: string | null
  workspaceId: number | null
}

const PLACEHOLDER = "—"

// Map a single API summary record into the table's TestRun shape.
export function mapSummaryToRun(s: TestRunSummary): TestRun {
  const passed = s.totalPassed ?? 0
  const failed = s.totalFailed ?? 0
  const skipped = s.totalSkipped ?? 0
  const total = passed + failed + skipped

  return {
    id: s.testRunId,
    name: s.name?.trim() || `Run ${s.testRunId}`,
    env: s.systemUnderTest?.trim() || PLACEHOLDER,
    build: s.buildVersion?.trim() || PLACEHOLDER,
    source: s.source?.trim() || PLACEHOLDER,
    executedUser: s.executedUser?.trim() || PLACEHOLDER,
    createdAt: s.executedAt ?? "",
    status: total === 0 ? "Initiated" : "Completed",
    total,
    passed,
    failed,
    skipped,
  }
}

export function mapSummaries(list: TestRunSummary[]): TestRun[] {
  return list.map(mapSummaryToRun)
}

export type RunFilters = {
  from: string // yyyy-mm-dd or ""
  to: string // yyyy-mm-dd or ""
  env: string // env value or "All"
  build: string // build value or "All"
}

export const EMPTY_FILTERS: RunFilters = {
  from: "",
  to: "",
  env: "All",
  build: "All",
}

// Distinct, non-empty env/build values present in the fetched runs.
export function deriveFilterOptions(runs: TestRun[]): {
  envs: string[]
  builds: string[]
} {
  const envs = Array.from(
    new Set(runs.map((r) => r.env).filter((e) => e && e !== PLACEHOLDER)),
  ).sort((a, b) => a.localeCompare(b))

  const builds = Array.from(
    new Set(runs.map((r) => r.build).filter((b) => b && b !== PLACEHOLDER)),
  ).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))

  return { envs, builds }
}

// Central query helper — filters the mapped runs by the panel's parameters.
export function queryRuns(
  runs: TestRun[],
  filters: RunFilters,
  search: string,
): TestRun[] {
  const q = search.trim().toLowerCase()
  const fromTime = filters.from ? new Date(filters.from).getTime() : null
  // include the whole "to" day
  const toTime = filters.to ? new Date(filters.to).getTime() + 86_400_000 : null

  return runs.filter((run) => {
    if (filters.env !== "All" && run.env !== filters.env) return false
    if (filters.build !== "All" && run.build !== filters.build) return false

    if (fromTime !== null || toTime !== null) {
      const created = run.createdAt ? new Date(run.createdAt).getTime() : NaN
      if (Number.isNaN(created)) return false
      if (fromTime !== null && created < fromTime) return false
      if (toTime !== null && created >= toTime) return false
    }

    if (
      q !== "" &&
      !run.name.toLowerCase().includes(q) &&
      !String(run.id).includes(q)
    ) {
      return false
    }
    return true
  })
}

export function countActiveFilters(filters: RunFilters): number {
  let n = 0
  if (filters.from) n++
  if (filters.to) n++
  if (filters.env !== "All") n++
  if (filters.build !== "All") n++
  return n
}

export function formatDate(iso: string) {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

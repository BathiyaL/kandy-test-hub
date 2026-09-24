import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { TestResultsView } from "@/components/test-results-view"

const LEGEND = [
  { label: "Passed", color: "bg-pass" },
  { label: "Failed", color: "bg-fail" },
  { label: "Skipped", color: "bg-blocked" },
  { label: "Pending", color: "bg-pending" },
]

export default function Page() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
                Test Results
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Monitor every test run across the ABC Product QA suite.
              </p>
            </div>
            <div className="flex items-center gap-4">
              {LEGEND.map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span className={`size-2.5 rounded-sm ${l.color}`} aria-hidden="true" />
                  <span className="text-xs text-muted-foreground">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          <TestResultsView />
        </main>
      </div>
    </div>
  )
}

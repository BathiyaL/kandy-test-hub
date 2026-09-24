import { cn } from "@/lib/utils"
import type { TestRun } from "@/lib/test-data"

type Segment = { label: string; value: number; color: string }

export function ProgressBar({ run }: { run: TestRun }) {
  const { total, passed, failed, skipped } = run
  const pending = Math.max(0, total - passed - failed - skipped)
  const done = passed + failed + skipped

  const segments: Segment[] = [
    { label: "Passed", value: passed, color: "bg-pass" },
    { label: "Failed", value: failed, color: "bg-fail" },
    { label: "Skipped", value: skipped, color: "bg-blocked" },
  ]

  if (total === 0) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex h-6 min-w-40 flex-1 items-center justify-center rounded-md bg-pending text-[11px] font-medium text-muted-foreground">
          No results
        </div>
        <span className="w-10 shrink-0 text-right text-xs font-medium text-muted-foreground tabular-nums">
          0/0
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-6 min-w-40 flex-1 overflow-hidden rounded-md bg-pending"
        role="img"
        aria-label={`${passed} passed, ${failed} failed, ${skipped} skipped, ${pending} pending of ${total}`}
      >
        {segments.map((seg) =>
          seg.value > 0 ? (
            <div
              key={seg.label}
              className={cn(
                "flex items-center justify-center text-[11px] font-semibold text-white tabular-nums",
                seg.color,
              )}
              style={{ width: `${(seg.value / total) * 100}%` }}
            >
              {seg.value}
            </div>
          ) : null,
        )}
        {pending > 0 && (
          <div className="flex flex-1 items-center justify-center text-[11px] font-medium text-muted-foreground tabular-nums">
            {pending}
          </div>
        )}
      </div>
      <span className="w-10 shrink-0 text-right text-xs font-medium text-muted-foreground tabular-nums">
        {done}/{total}
      </span>
    </div>
  )
}

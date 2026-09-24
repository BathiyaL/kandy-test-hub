import { cn } from "@/lib/utils"
import type { RunStatus } from "@/lib/test-data"

const STYLES: Record<RunStatus, { dot: string; text: string; bg: string }> = {
  Initiated: {
    dot: "bg-muted-foreground",
    text: "text-muted-foreground",
    bg: "bg-muted",
  },
  "In Progress": {
    dot: "bg-blocked",
    text: "text-foreground",
    bg: "bg-blocked/12",
  },
  Completed: {
    dot: "bg-pass",
    text: "text-foreground",
    bg: "bg-pass/12",
  },
}

export function StatusBadge({ status }: { status: RunStatus }) {
  const s = STYLES[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        s.bg,
        s.text,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          s.dot,
          status === "In Progress" && "animate-pulse",
        )}
        aria-hidden="true"
      />
      {status}
    </span>
  )
}

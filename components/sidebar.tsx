"use client"

import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ClipboardCheck,
  FileText,
  BarChart3,
} from "lucide-react"

const NAV = [
  { label: "Dashboard", icon: LayoutDashboard, active: false },
  { label: "Test Cases", icon: ClipboardCheck, active: false },
  { label: "Test Plan Template", icon: FileText, active: false },
  { label: "Test Results", icon: BarChart3, active: true },
]

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex flex-col items-center gap-3 border-b border-sidebar-border px-6 py-7 text-center">
        <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold tracking-wide text-accent-foreground">
          ABC Product QA
        </span>
        <div className="flex size-16 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
          BL
        </div>
        <div>
          <p className="text-sm font-semibold text-sidebar-foreground">
            Bathiya Ladduwahetty
          </p>
          <p className="text-xs text-muted-foreground">QA Lead</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV.map(({ label, icon: Icon, active }) => (
          <a
            key={label}
            href="#"
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-[18px]" />
            {label}
          </a>
        ))}
      </nav>
    </aside>
  )
}

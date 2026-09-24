"use client"

import { Button } from "@/components/ui/button"
import { Menu, Plus, Bell, FlaskConical } from "lucide-react"

export function Topbar() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Toggle navigation"
        >
          <Menu className="size-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <FlaskConical className="size-[18px]" />
          </div>
          <span className="text-base font-semibold tracking-tight">
            TestPilot
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" className="gap-1.5">
          <Plus className="size-4" />
          New Run
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="text-muted-foreground"
        >
          <Bell className="size-5" />
        </Button>
        <div className="ml-1 flex size-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
          BL
        </div>
      </div>
    </header>
  )
}

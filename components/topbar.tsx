"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, Plus, Bell, FlaskConical, FileJson, TestTube2, Upload, CheckCircle2 } from "lucide-react"

export function Topbar() {
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [fileName, setFileName] = useState("")
  const [fileError, setFileError] = useState("")
  const [validationError, setValidationError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isValidJson, setIsValidJson] = useState(false)
  const [parsedJson, setParsedJson] = useState<unknown>(undefined)
  const [payloadPreview, setPayloadPreview] = useState<unknown>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [source, setSource] = useState("Bruno")
  const [runName, setRunName] = useState("")
  const [env, setEnv] = useState("")
  const [buildVersion, setBuildVersion] = useState("")
  const [executedAt, setExecutedAt] = useState("")
  const [executedNode, setExecutedNode] = useState("")
  const [executedUser, setExecutedUser] = useState("")
  const [userLog, setUserLog] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setFileError("")
    setValidationError("")
    setSuccessMessage("")
    setIsValidJson(false)
    setParsedJson(undefined)
    setPayloadPreview(undefined)

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        setParsedJson(parsed)
        setIsValidJson(true)
      } catch {
        setFileError("This file is not valid JSON.")
      }
    }
    reader.onerror = () => setFileError("Unable to read this file.")
    reader.readAsText(file)
  }

  const resetUpload = () => {
    setFileName("")
    setFileError("")
    setValidationError("")
    setSuccessMessage("")
    setIsValidJson(false)
    setParsedJson(undefined)
    setPayloadPreview(undefined)
    setSource("Bruno")
    setRunName("")
    setEnv("")
    setBuildVersion("")
    setExecutedAt("")
    setExecutedNode("")
    setExecutedUser("")
    setUserLog("")
    if (inputRef.current) inputRef.current.value = ""
  }

  const handleUpload = async () => {
    setValidationError("")
    setSuccessMessage("")

    const requiredFields = [
      ["Source", source],
      ["Name", runName],
      ["Env", env],
      ["Build Version", buildVersion],
      ["Executed At", executedAt],
      ["Executed Node", executedNode],
      ["Executed User", executedUser],
      ["User Log", userLog],
    ] as const
    const missing = requiredFields.filter(([, value]) => !value.trim()).map(([label]) => label)

    if (missing.length > 0) {
      setValidationError(`Complete all required fields: ${missing.join(", ")}.`)
      return
    }
    if (!isValidJson || parsedJson === undefined) {
      setFileError("Select a valid JSON file before submitting.")
      return
    }

    const executedAtDate = new Date(executedAt)
    if (Number.isNaN(executedAtDate.getTime())) {
      setValidationError("Enter a valid Executed At date and time.")
      return
    }

    const payload = {
      workspaceId: 1,
      source: source.trim(),
      name: runName.trim(),
      systemUnderTest: env.trim(),
      buildVersion: buildVersion.trim(),
      executedNode: executedNode.trim(),
      executedUser: executedUser.trim(),
      executedAt: executedAtDate.toISOString(),
      userLogs: userLog.trim(),
      rawJsonResult: JSON.stringify(parsedJson),
    }

    // The payload is ready for POST /api/v1/test-runs/upload-raw.
    // Keep the preview local while that backend endpoint is unavailable.
    console.log("[v0] Test run upload payload:", payload)
    setPayloadPreview(payload)
    //setSuccessMessage("Payload constructed successfully. Ready for POST /api/v1/test-runs/upload-raw.")
    //setIsSubmitting(false)

    try {
      const response = await fetch("/api/test-runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.status === 201) {
        setSuccessMessage("Test run uploaded successfully.")
      } else {
        setValidationError("The test run upload was not created.")
      }
    } catch {
      setValidationError("Unable to upload the test run.")
    } finally {
      setIsSubmitting(false)
    }
    
  }

  return (
    <>
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
            <span className="text-base font-semibold tracking-tight">TestPilot</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button size="sm" aria-haspopup="menu" />}>
              <Plus data-icon="inline-start" />
              New
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
              <DropdownMenuItem onClick={() => {}}>
                <TestTube2 />
                New Testcase
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { resetUpload(); setIsUploadOpen(true) }}>
                <FileJson />
                New Test Run
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload test run</DialogTitle>
            <DialogDescription>
              Upload a JSON response to add a new test run to the results view.
            </DialogDescription>
          </DialogHeader>

          <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Source
                <select
                  value={source}
                  onChange={(event) => setSource(event.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm font-normal outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
                >
                  <option>Bruno</option>
                  <option>Postman</option>
                  <option>Custom</option>
                </select>
              </label>
              <FormField label="Name" value={runName} onChange={setRunName} placeholder="Smoke test run" />
              <FormField label="Env" value={env} onChange={setEnv} placeholder="staging" />
              <FormField label="Build Version" value={buildVersion} onChange={setBuildVersion} placeholder="v2.14.0" />
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Executed At
                <input
                  type="datetime-local"
                  value={executedAt}
                  onChange={(event) => setExecutedAt(event.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm font-normal outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
                <span className="text-xs font-normal text-muted-foreground">
                  Sent as an ISO 8601 timestamp.
                </span>
              </label>
              <FormField label="Executed Node" value={executedNode} onChange={setExecutedNode} placeholder="runner-01" />
              <FormField label="Executed User" value={executedUser} onChange={setExecutedUser} placeholder="qa@example.com" />
              <FormField label="User Log" value={userLog} onChange={setUserLog} placeholder="Optional log reference" className="sm:col-span-2" />
            </div>

            {validationError && (
              <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {validationError}
              </p>
            )}
            {successMessage && (
              <p role="status" className="rounded-md bg-pass/10 px-3 py-2 text-sm text-pass">
                {successMessage}
              </p>
            )}
            {payloadPreview !== undefined && (
              <details className="rounded-md border border-border bg-muted/30 px-3 py-2">
                <summary className="cursor-pointer text-sm font-medium">Preview request payload</summary>
                <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words text-xs text-muted-foreground">
                  {JSON.stringify(payloadPreview, null, 2)}
                </pre>
              </details>
            )}

            <div className="flex flex-col gap-3">
              <input
                ref={inputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="sr-only"
                id="test-run-json"
              />
              <label
                htmlFor="test-run-json"
                className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-8 text-center transition-colors hover:bg-muted/60"
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Upload />
                </span>
                <span className="text-sm font-medium text-foreground">
                  {fileName || "Choose a JSON file"}
                </span>
                <span className="text-xs text-muted-foreground">
                  TestRunsSummary JSON, up to 10 MB
                </span>
              </label>
              {isValidJson && (
                <p className="flex items-center gap-2 text-sm text-pass">
                  <CheckCircle2 className="size-4" /> Valid JSON file selected
                </p>
              )}
              {fileError && <p className="text-sm text-destructive">{fileError}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button disabled={isSubmitting} onClick={handleUpload}>
              {isSubmitting ? "Submitting…" : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
}) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm font-medium ${className ?? ""}`}>
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm font-normal outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
      />
    </label>
  )
}
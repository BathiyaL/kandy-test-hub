import { NextResponse } from "next/server"
import type { TestRunSummary } from "@/lib/test-data"

const SOURCE_URL =
  process.env.TEST_RUNS_SOURCE_URL ?? "http://localhost:8080/api/testRun"

export async function GET(request: Request) {
  try {
    const authorization =
      request.headers.get("authorization") ??
      (process.env.TEST_RUNS_USERNAME && process.env.TEST_RUNS_PASSWORD
        ? `Basic ${Buffer.from(
            `${process.env.TEST_RUNS_USERNAME}:${process.env.TEST_RUNS_PASSWORD}`,
          ).toString("base64")}`
        : undefined)

    const res = await fetch(SOURCE_URL, {
      cache: "no-store",
      headers: authorization ? { authorization } : undefined,
    })

    if (!res.ok) {
      console.error(`Upstream responded with ${res.status}`)
      console.error(`Upstream responded with ${res.statusText}`)
      return NextResponse.json(
        { error: `Upstream responded with ${res.status}` },
        { status: res.status },
      )
    }

    const data = (await res.json()) as TestRunSummary[]
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch test runs" },
      { status: 500 },
    )
  }
}

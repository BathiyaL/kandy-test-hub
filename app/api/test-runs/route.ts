import { NextResponse } from "next/server"
import type { TestRunSummary } from "@/lib/test-data"

const API_BASE_URL =
  process.env.TEST_RUNS_API_BASE_URL ?? "http://localhost:8080"

const ENDPOINTS = {
  testRuns: "api/v1/test-runs",
  uploadRaw: "api/v1/test-runs/upload-raw",
} as const

function getUpstreamUrl(endpoint: string) {
  return new URL(endpoint, `${API_BASE_URL.replace(/\/+$/, "")}/`)
}

function getAuthorization(request: Request) {
  return (
    request.headers.get("authorization") ??
    (process.env.TEST_RUNS_USERNAME && process.env.TEST_RUNS_PASSWORD
      ? `Basic ${Buffer.from(
          `${process.env.TEST_RUNS_USERNAME}:${process.env.TEST_RUNS_PASSWORD}`,
        ).toString("base64")}`
      : undefined)
  )
}

function logUpstreamFailure({
  method,
  endpoint,
  url,
  status,
  statusText,
  responseBody,
  error,
}: {
  method: string
  endpoint: string
  url?: string
  status?: number
  statusText?: string
  responseBody?: string
  error?: unknown
}) {
  const errorDetails =
    error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : error === undefined
        ? undefined
        : { message: String(error) }

  console.error(
    "upstream_api_failure",
    JSON.stringify({
      timestamp: new Date().toISOString(),
      method,
      endpoint,
      url,
      status,
      statusText,
      responseBody,
      error: errorDetails,
    }),
  )
}

export async function POST(request: Request) {
  const endpoint = ENDPOINTS.uploadRaw
  let upstreamUrl: URL | undefined

  try {
    const payload = await request.text()
    const authorization = getAuthorization(request)
    upstreamUrl = getUpstreamUrl(endpoint)

    const response = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authorization && { authorization }),
      },
      body: payload,
    })

    const responseBody = await response.text()
    if (!response.ok) {
      logUpstreamFailure({
        method: "POST",
        endpoint,
        url: upstreamUrl.toString(),
        status: response.status,
        statusText: response.statusText,
        responseBody,
      })
    }

    return new Response(responseBody, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
      },
    })
  } catch (error) {
    logUpstreamFailure({
      method: "POST",
      endpoint,
      url: upstreamUrl?.toString(),
      error,
    })
    return NextResponse.json(
      { error: "Failed to send test run to upstream service" },
      { status: 502 },
    )
  }
}

export async function GET(request: Request) {
  const endpoint = ENDPOINTS.testRuns
  let sourceUrl: URL | undefined

  try {
    sourceUrl = getUpstreamUrl(endpoint)
    sourceUrl.searchParams.set("workspaceId", "1")
    const authorization = getAuthorization(request)

    const response = await fetch(sourceUrl, {
      cache: "no-store",
      headers: authorization ? { authorization } : undefined,
    })

    if (!response.ok) {
      const responseBody = await response.text()
      logUpstreamFailure({
        method: "GET",
        endpoint,
        url: sourceUrl.toString(),
        status: response.status,
        statusText: response.statusText,
        responseBody,
      })
      return NextResponse.json(
        { error: "Failed to fetch test runs from upstream service" },
        { status: response.status },
      )
    }

    const data = (await response.json()) as TestRunSummary[]
    return NextResponse.json(data)
  } catch (error) {
    logUpstreamFailure({
      method: "GET",
      endpoint,
      url: sourceUrl?.toString(),
      error,
    })
    return NextResponse.json(
      { error: "Failed to fetch test runs from upstream service" },
      { status: 502 },
    )
  }
}

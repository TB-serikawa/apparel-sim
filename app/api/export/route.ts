// Next.js Route Handler — receives the export request from the client and
// forwards it to the AWS Lambda export function.
//
// In production this acts as a thin proxy so API keys / Lambda URLs are not
// exposed to the browser.  In local development, set EXPORT_LAMBDA_URL to the
// SAM CLI local endpoint (http://localhost:3001).

import { NextRequest, NextResponse } from 'next/server'

const LAMBDA_URL = process.env.EXPORT_LAMBDA_URL

export async function POST(request: NextRequest) {
  if (!LAMBDA_URL) {
    return NextResponse.json(
      { error: 'EXPORT_LAMBDA_URL is not configured on the server.' },
      { status: 503 },
    )
  }

  const body = await request.json()

  const lambdaRes = await fetch(LAMBDA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await lambdaRes.json()

  return NextResponse.json(data, { status: lambdaRes.status })
}

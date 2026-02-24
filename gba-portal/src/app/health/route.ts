import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function getVersion() {
  return (
    process.env.NEXT_PUBLIC_GIT_SHA ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.RENDER_GIT_COMMIT ||
    process.env.GIT_COMMIT_SHA ||
    null
  )
}

export function GET() {
  const version = getVersion()

  return NextResponse.json(
    {
      ok: true,
      service: 'gba-portal',
      ts: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      version,
    },
    {
      status: 200,
      headers: {
        'cache-control': 'no-store',
        'x-robots-tag': 'noindex, nofollow, noarchive',
        'x-content-type-options': 'nosniff',
        'referrer-policy': 'no-referrer',
      },
    }
  )
}

export function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow, noarchive',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
    },
  })
}

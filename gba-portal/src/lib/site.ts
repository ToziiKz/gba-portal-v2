function normalizeBaseUrl(value: string) {
  const trimmed = value.trim()
  const withProtocol =
    trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`
  return withProtocol.endsWith('/') ? withProtocol.slice(0, -1) : withProtocol
}

export function getBaseUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    process.env.VERCEL_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    process.env.FLY_PUBLIC_URL ||
    'http://localhost:3000'

  return normalizeBaseUrl(raw)
}

export function getMetadataBase() {
  return new URL(getBaseUrl())
}

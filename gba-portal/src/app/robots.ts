import type { MetadataRoute } from 'next'

import { getBaseUrl } from '@/lib/site'

export const revalidate = 3600

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl()

  const host = new URL(baseUrl).host

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/login', '/dashboard', '/health', '/api', '/_next', '/favicon.ico'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/login', '/dashboard', '/health', '/api', '/_next'],
      },
    ],
    host,
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

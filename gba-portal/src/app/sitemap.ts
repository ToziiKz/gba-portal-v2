import type { MetadataRoute } from 'next'

import { getBaseUrl } from '@/lib/site'

export const revalidate = 3600

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl()
  const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME
    ? new Date(process.env.NEXT_PUBLIC_BUILD_TIME)
    : null
  const lastModified = buildTime ?? new Date()

  return [
    { url: `${baseUrl}/`, lastModified, changeFrequency: 'weekly', priority: 1 },

    // Public “conversion / trust” pages
    { url: `${baseUrl}/shop`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/news`, lastModified, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/sponsors`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/about`, lastModified, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${baseUrl}/contact`, lastModified, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${baseUrl}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${baseUrl}/terms`, lastModified, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${baseUrl}/accessibility`, lastModified, changeFrequency: 'yearly', priority: 0.2 },
  ]
}

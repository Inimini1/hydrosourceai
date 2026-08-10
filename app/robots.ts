import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hydrosource.appscloud365.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',
        '/pools',
        '/billing',
        '/account',
        '/notifications',
        '/onboarding',
        '/admin',
        '/api',
        '/verify-email',
        '/reset-password',
        '/forgot-password',
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}

// @ts-check
const { withSentryConfig } = require('@sentry/nextjs')

const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://lh3.googleusercontent.com https://avatars.githubusercontent.com",
  "font-src 'self'",
  "connect-src 'self' https://api.stripe.com https://generativelanguage.googleapis.com https://*.sentry.io https://us.i.posthog.com https://us.posthog.com https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com",
  "worker-src 'self' blob:",
  "frame-src https://js.stripe.com https://hooks.stripe.com https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
]

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=()' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Content-Security-Policy', value: cspDirectives.join('; ') },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
  experimental: {
    // pdfkit resolves its AFM font files relative to its own __dirname at
    // runtime. When webpack bundles pdfkit into the route's compiled chunk
    // (the default), it rewrites __dirname to point at the bundle's own
    // output directory instead of pdfkit's real location under
    // node_modules/pdfkit/js — so it looks for "data/Helvetica.afm" in the
    // wrong place and throws ENOENT, in production only. Keeping pdfkit
    // external stops webpack from bundling/rewriting it, so its __dirname
    // stays correct and it finds the files this outputFileTracingIncludes
    // entry ensures are actually present in the deployed function.
    serverComponentsExternalPackages: ['pdfkit'],
    outputFileTracingIncludes: {
      '/api/reports/send': ['./node_modules/pdfkit/js/data/**/*'],
    },
  },
}

module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: { deleteSourcemapsAfterUpload: true },
  disableLogger: true,
  automaticVercelMonitors: true,
})

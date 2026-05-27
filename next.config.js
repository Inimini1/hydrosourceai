/** @type {import('next').NextConfig} */

const securityHeaders = [
  // Prevent clickjacking — page can only be embedded by same origin
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Prevent MIME-type sniffing — browser must use declared content-type
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Control referrer info sent to third-party sites
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable unused browser APIs to reduce attack surface
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  // Force HTTPS for 2 years (production only — set via Vercel env for prod)
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Prevent DNS prefetch leaks
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
]

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
}

module.exports = nextConfig

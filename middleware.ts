import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PAGES   = new Set(['/', '/login', '/signup', '/forgot-password', '/reset-password', '/verify-email', '/beta-access', '/pricing'])
const PUBLIC_API     = new Set(['/api/health', '/api/beta/apply', '/api/stripe/webhook'])
const PUBLIC_API_PFX = ['/api/auth/']

function isPublicRoute(pathname: string) {
  if (PUBLIC_PAGES.has(pathname)) return true
  if (PUBLIC_API.has(pathname)) return true
  if (PUBLIC_API_PFX.some((p) => pathname.startsWith(p))) return true
  if (pathname.startsWith('/legal/')) return true
  return false
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — MUST happen before any auth checks
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (isPublicRoute(pathname)) return response

  // Protected: redirect unauthenticated users
  if (!user) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // Redirect logged-in users away from auth pages
  if (user && (pathname === '/login' || pathname === '/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)'],
}

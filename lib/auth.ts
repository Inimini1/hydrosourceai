import { SignJWT, jwtVerify } from 'jose'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is not set')
}
const SECRET = new TextEncoder().encode(jwtSecret ?? 'dev-secret-change-in-production-32chars!!')
const COOKIE = 'HydroSource_token'
const MAX_AGE = 7 * 24 * 60 * 60

export interface JWTPayload {
  userId: string
  role: string
}

export async function createToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET)
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, SECRET)
  return payload as unknown as JWTPayload
}

export async function getAuthUser(req: NextRequest): Promise<JWTPayload | null> {
  const token = req.cookies.get(COOKIE)?.value
  if (!token) return null
  try {
    return await verifyToken(token)
  } catch {
    return null
  }
}

export function setAuthCookie(res: NextResponse, token: string): void {
  res.cookies.set({
    name: COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  })
}

export function clearAuthCookie(res: NextResponse): void {
  res.cookies.set({ name: COOKIE, value: '', maxAge: 0, path: '/', httpOnly: true, sameSite: 'strict' })
}

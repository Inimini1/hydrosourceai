import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { password } = body

  const user = await prisma.user.findUnique({ where: { id: auth.userId } })
  if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 })

  if (user.passwordHash) {
    if (!password) return NextResponse.json({ error: 'Password is required to delete your account.' }, { status: 400 })
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return NextResponse.json({ error: 'Incorrect password.' }, { status: 400 })
  }

  await prisma.user.delete({ where: { id: auth.userId } })

  const res = NextResponse.json({ message: 'Account deleted.' })
  res.cookies.set('HydroSource_token', '', { maxAge: 0, path: '/' })
  return res
}

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, email: true, role: true, subscriptionStatus: true, createdAt: true },
  })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ user })
}

export async function PATCH(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // Profile update (displayName / avatarColor)
  if ('displayName' in body || 'avatarColor' in body) {
    const data: Record<string, string> = {}
    if (typeof body.displayName === 'string') data.displayName = body.displayName.trim().slice(0, 40)
    if (typeof body.avatarColor === 'string' && /^#[0-9A-Fa-f]{6}$/.test(body.avatarColor)) data.avatarColor = body.avatarColor
    await prisma.user.update({ where: { id: auth.userId }, data })
    return NextResponse.json({ message: 'Profile updated.' })
  }

  const { currentPassword, newPassword } = body

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Both current and new passwords are required.' }, { status: 400 })
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: auth.userId } })
  if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 })

  const valid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id: auth.userId }, data: { passwordHash } })

  return NextResponse.json({ message: 'Password updated.' })
}

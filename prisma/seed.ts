import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('password123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'demo@HydroSource.ai' },
    update: {},
    create: { email: 'demo@HydroSource.ai', passwordHash: hash, role: 'OWNER' },
  })

  const pool = await prisma.pool.upsert({
    where: { id: 'demo-pool-1' },
    update: {},
    create: {
      id: 'demo-pool-1',
      userId: user.id,
      poolName: 'Backyard Pool',
      gallons: 15000,
      chlorineType: 'CHLORINE',
    },
  })

  await prisma.waterTest.create({
    data: {
      poolId: pool.id,
      chlorine: 2.1,
      pH: 7.4,
      alkalinity: 95,
      status: 'safe',
      aiAnalysis: JSON.stringify({
        status: 'safe',
        diagnosis: 'Your pool water is well-balanced. No action needed.',
        actions: ['Continue regular maintenance schedule.'],
        chemical_adjustments: { chlorine: 'None needed', pH: 'None needed', alkalinity: 'None needed' },
      }),
    },
  })

  console.log('Seed complete. Demo: demo@HydroSource.ai / password123')
}

main().catch(console.error).finally(() => prisma.$disconnect())

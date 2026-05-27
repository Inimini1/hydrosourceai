'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import StatusBadge from '@/components/StatusBadge'
import { PoolLensIcon } from '@/components/brand'
import { EmptyStateView } from '@/components/EmptyStateView'

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { type: 'spring' as const, stiffness: 400, damping: 36 } },
}

interface Pool {
  id: string
  poolName: string
  gallons: number
  chlorineType: string
  createdAt: string
  _count: { waterTests: number; serviceLogs: number }
  waterTests: Array<{ status: string; createdAt: string }>
}

export default function PoolsPage() {
  const [pools, setPools] = useState<Pool[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/pools')
      .then((r) => r.json())
      .then((d) => setPools(d.pools ?? []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="px-4 pt-12 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-3xl h-20 animate-pulse border border-slate-100" />
        ))}
      </div>
    )
  }

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-4 pt-12 pb-5 flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-slate-900 text-xl">My Pools</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {pools.length === 0 ? 'Add your first pool to get started' : `${pools.length} pool${pools.length !== 1 ? 's' : ''} managed`}
          </p>
        </div>
        <Link href="/pools/new" className="btn-teal flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-2xl">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add Pool
        </Link>
      </div>

      <div className="px-4">
        {pools.length === 0 ? (
          <EmptyStateView
            scene="no-pools"
            action={{ label: 'Add your first pool', href: '/pools/new' }}
          />
        ) : (
          <motion.div className="space-y-3" variants={listVariants} initial="hidden" animate="show">
            {pools.map((pool) => {
              const lastTest = pool.waterTests[0]
              return (
                <motion.div key={pool.id} variants={itemVariants} whileTap={{ scale: 0.98 }}>
                  <Link
                    href={`/pools/${pool.id}`}
                    className="card-light rounded-3xl p-4 flex items-center gap-4 hover:shadow-md transition-all duration-200 block"
                  >
                    <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                      <PoolLensIcon size={48} variant="dark" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-display font-semibold text-slate-900 truncate">{pool.poolName}</h2>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {pool.gallons.toLocaleString()} gal · {pool._count.waterTests} tests
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {lastTest ? (
                        <StatusBadge status={lastTest.status as 'safe' | 'caution' | 'critical'} />
                      ) : (
                        <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">No tests</span>
                      )}
                      <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
            <motion.div variants={itemVariants}>
              <Link
                href="/pools/new"
                className="flex items-center justify-center gap-2 p-4 rounded-3xl border-2 border-dashed border-slate-200 text-sm font-medium text-slate-400 hover:text-teal-500 hover:border-teal-200 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add another pool
              </Link>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

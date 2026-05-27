import { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native'
import { Link } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase'

interface Pool {
  id: string; pool_name: string; gallons: number; chlorine_type: string
  water_tests: Array<{ status: string; created_at: string }>
}

const STATUS_COLOR: Record<string, string> = { safe: '#3cddc7', caution: '#b1c5ff', critical: '#ffb4ab' }
const STATUS_LABEL: Record<string, string> = { safe: 'Balanced', caution: 'Monitor', critical: 'Action' }

export default function PoolsScreen() {
  const insets = useSafeAreaInsets()
  const [pools,      setPools]      = useState<Pool[]>([])
  const [loading,    setLoading]    = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function load() {
    const { data } = await supabase
      .from('pools')
      .select('id, pool_name, gallons, chlorine_type, water_tests(status, created_at)')
      .order('created_at', { ascending: false })
      .order('created_at', { ascending: false, foreignTable: 'water_tests' })
      .limit(1, { foreignTable: 'water_tests' })
    setPools((data as Pool[]) ?? [])
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { load() }, [])

  if (loading) {
    return <View className="flex-1 bg-background items-center justify-center"><ActivityIndicator color="#00f2ff" /></View>
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-4 pb-4">
        <View>
          <Text className="text-on-surface font-bold text-xl">My Pools</Text>
          <Text className="text-muted text-xs mt-0.5">
            {pools.length === 0 ? 'Add your first pool' : `${pools.length} pool${pools.length !== 1 ? 's' : ''} managed`}
          </Text>
        </View>
        <Link href="/(tabs)/pools/new" asChild>
          <TouchableOpacity className="rounded-2xl px-4 py-2.5 flex-row items-center gap-2"
            style={{ backgroundColor: '#3cddc7' }}>
            <Text style={{ color: '#003731', fontWeight: '700', fontSize: 13 }}>+ Add Pool</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <FlatList
        data={pools}
        keyExtractor={(p) => p.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} tintColor="#00f2ff" />}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Text className="text-4xl mb-4">💧</Text>
            <Text className="text-on-surface font-semibold text-base mb-2">No pools yet</Text>
            <Text className="text-muted text-sm text-center mb-6">Add your first pool to get started with AI water testing.</Text>
            <Link href="/(tabs)/pools/new" asChild>
              <TouchableOpacity className="rounded-2xl py-3 px-8" style={{ backgroundColor: '#00f2ff' }}>
                <Text style={{ color: '#00363a', fontWeight: '700' }}>Add Pool</Text>
              </TouchableOpacity>
            </Link>
          </View>
        }
        renderItem={({ item: pool }) => {
          const last    = pool.water_tests?.[0]
          const color   = STATUS_COLOR[last?.status ?? ''] ?? '#849495'
          const label   = STATUS_LABEL[last?.status ?? ''] ?? 'No data'
          return (
            <Link href={`/(tabs)/pools/${pool.id}`} asChild>
              <TouchableOpacity
                className="rounded-2xl p-4 flex-row items-center gap-4"
                style={{ backgroundColor: 'rgba(27,32,37,0.70)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' }}
              >
                {/* Status pill */}
                <View className="w-2 rounded-full flex-shrink-0" style={{ height: 36, backgroundColor: color, shadowColor: color, shadowOpacity: 0.5, shadowRadius: 8 }} />
                <View className="flex-1">
                  <Text className="text-on-surface font-semibold text-sm">{pool.pool_name}</Text>
                  <Text className="text-muted text-xs mt-0.5">{pool.gallons.toLocaleString()} gal</Text>
                </View>
                <Text className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>{label}</Text>
                <Text className="text-muted text-sm">›</Text>
              </TouchableOpacity>
            </Link>
          )
        }}
      />
    </View>
  )
}

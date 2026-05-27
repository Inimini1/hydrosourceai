import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native'
import { Link } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface Pool {
  id: string; pool_name: string; gallons: number
  water_tests: Array<{ status: string; ph: number; chlorine: number; alkalinity: number; ai_analysis: string; created_at: string }>
}

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function parseScore(raw: string) {
  try { return JSON.parse(raw).health_score ?? 0 } catch { return 0 }
}

export default function DashboardScreen() {
  const { user, signOut } = useAuth()
  const insets = useSafeAreaInsets()
  const [pools,     setPools]     = useState<Pool[]>([])
  const [loading,   setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function load() {
    const { data } = await supabase
      .from('pools')
      .select('id, pool_name, gallons, water_tests(status, ph, chlorine, alkalinity, ai_analysis, created_at)')
      .order('created_at', { ascending: false })
      .order('created_at', { ascending: false, foreignTable: 'water_tests' })
      .limit(1, { foreignTable: 'water_tests' })
    setPools((data as Pool[]) ?? [])
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { load() }, [])

  const primary  = pools[0]
  const lastTest = primary?.water_tests?.[0]
  const score    = lastTest ? Math.round(Math.max(0, Math.min(100, parseScore(lastTest.ai_analysis)))) : 0
  const scoreColor = score >= 75 ? '#3cddc7' : score >= 50 ? '#b1c5ff' : '#ffb4ab'
  const statusLabel = score >= 75 ? 'Optimal Status' : score >= 50 ? 'Needs Attention' : 'Action Required'

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#00f2ff" />
      </View>
    )
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 100 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} tintColor="#00f2ff" />}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 mb-6">
        <View>
          <Text className="text-muted text-xs uppercase tracking-widest font-medium">SmartPool AI</Text>
          <Text className="text-on-surface font-bold text-2xl">{primary?.pool_name ?? 'Welcome'}</Text>
        </View>
        <TouchableOpacity
          onPress={signOut}
          className="rounded-2xl px-3 py-2"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <Text className="text-muted text-xs">Sign Out</Text>
        </TouchableOpacity>
      </View>

      {!primary ? (
        /* Empty state */
        <View className="items-center justify-center px-8 py-16">
          <Text className="text-5xl mb-4">💧</Text>
          <Text className="text-on-surface font-bold text-lg text-center mb-2">No pools yet</Text>
          <Text className="text-muted text-sm text-center mb-6">Add your first pool to start AI-powered water monitoring.</Text>
          <Link href="/(tabs)/pools" asChild>
            <TouchableOpacity className="rounded-2xl py-3 px-8" style={{ backgroundColor: '#00f2ff' }}>
              <Text style={{ color: '#00363a', fontWeight: '700' }}>Add Pool</Text>
            </TouchableOpacity>
          </Link>
        </View>
      ) : (
        <>
          {/* Hero droplet score */}
          <View className="items-center py-8">
            <View className="w-44 h-44 items-center justify-center"
              style={{
                borderRadius: 80, backgroundColor: 'rgba(0,242,255,0.15)',
                borderWidth: 1.5, borderColor: 'rgba(0,242,255,0.30)',
                shadowColor: '#00f2ff', shadowOpacity: 0.3, shadowRadius: 24,
              }}>
              <Text style={{ fontSize: 64, fontWeight: '900', color: '#0a0f14' }}>{score}</Text>
              <Text style={{ fontSize: 11, color: 'rgba(10,15,20,0.55)', letterSpacing: 2 }}>/ 100</Text>
            </View>
            <Text className="text-primary text-xs uppercase tracking-widest mt-5 mb-1">System Health</Text>
            <Text className="text-on-surface font-bold text-2xl">{statusLabel}</Text>
            {lastTest && (
              <Text className="text-muted text-xs mt-2 uppercase tracking-wider">
                Last tested {timeAgo(lastTest.created_at)}
              </Text>
            )}
          </View>

          {/* Metric cards */}
          {lastTest && (
            <View className="flex-row gap-3 px-4 mb-3">
              {[
                { label: 'pH', value: lastTest.ph.toFixed(1), unit: '', ok: lastTest.ph >= 7.2 && lastTest.ph <= 7.6 },
                { label: 'Chlorine', value: lastTest.chlorine.toFixed(1), unit: 'ppm', ok: lastTest.chlorine >= 1 && lastTest.chlorine <= 3 },
              ].map((m) => (
                <View key={m.label} className="flex-1 rounded-2xl p-4"
                  style={{ backgroundColor: 'rgba(15,20,25,0.60)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
                  <Text className="text-muted text-xs uppercase tracking-widest mb-1">{m.label}</Text>
                  <Text className="text-on-surface font-bold text-3xl">{m.value}</Text>
                  <Text className="text-xs mt-1" style={{ color: m.ok ? '#3cddc7' : '#b1c5ff' }}>
                    {m.ok ? 'Optimal' : 'Monitor'}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Quick actions */}
          <View className="flex-row gap-3 px-4">
            <Link href={`/(tabs)/pools`} asChild>
              <TouchableOpacity className="flex-1 rounded-2xl py-4 items-center"
                style={{ backgroundColor: 'rgba(0,242,255,0.10)', borderWidth: 1, borderColor: 'rgba(0,242,255,0.25)' }}>
                <Text className="text-primary font-semibold text-sm">⚗ Test Water</Text>
                <Text className="text-muted text-xs mt-0.5 uppercase tracking-widest">~90 seconds</Text>
              </TouchableOpacity>
            </Link>
            <Link href={`/(tabs)/pools`} asChild>
              <TouchableOpacity className="flex-1 rounded-2xl py-4 items-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
                <Text className="text-on-surface font-semibold text-sm">📊 History</Text>
                <Text className="text-muted text-xs mt-0.5 uppercase tracking-widest">View Trends</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </>
      )}
    </ScrollView>
  )
}

import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface Profile {
  display_name: string | null; role: string; avatar_color: string | null; beta_expires_at: string | null
}
interface Subscription { plan_type: string; status: string }

export default function ProfileScreen() {
  const { user, signOut } = useAuth()
  const insets = useSafeAreaInsets()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sub,     setSub]     = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.from('profiles').select('display_name, role, avatar_color, beta_expires_at').eq('id', user.id).single(),
      supabase.from('subscriptions').select('plan_type, status').eq('user_id', user.id).single(),
    ]).then(([{ data: p }, { data: s }]) => {
      setProfile(p)
      setSub(s)
      setLoading(false)
    })
  }, [user])

  if (loading) {
    return <View className="flex-1 bg-background items-center justify-center"><ActivityIndicator color="#00f2ff" /></View>
  }

  const planBadge = sub?.plan_type === 'FREE' ? 'Free' : sub?.plan_type === 'PRO_MONTHLY' ? 'Pro Monthly' : 'Pro Yearly'
  const isBeta    = profile?.beta_expires_at && new Date(profile.beta_expires_at) > new Date()

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 100 }}>
      <Text className="text-on-surface font-bold text-xl px-5 mb-6">Profile</Text>

      {/* Avatar + name */}
      <View className="items-center mb-8">
        <View className="w-20 h-20 rounded-full items-center justify-center mb-3"
          style={{ backgroundColor: profile?.avatar_color ?? '#006FFF' }}>
          <Text style={{ fontSize: 28, color: '#fff', fontWeight: '700' }}>
            {(user?.email?.[0] ?? '?').toUpperCase()}
          </Text>
        </View>
        <Text className="text-on-surface font-semibold text-lg">{profile?.display_name ?? user?.email}</Text>
        <Text className="text-muted text-sm">{user?.email}</Text>

        <View className="flex-row gap-2 mt-3">
          {isBeta && (
            <View className="px-3 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(0,242,255,0.10)', borderWidth: 1, borderColor: 'rgba(0,242,255,0.25)' }}>
              <Text className="text-primary text-xs font-bold tracking-widest">BETA</Text>
            </View>
          )}
          <View className="px-3 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(60,221,199,0.10)', borderWidth: 1, borderColor: 'rgba(60,221,199,0.25)' }}>
            <Text className="text-safe text-xs font-semibold">{planBadge}</Text>
          </View>
        </View>
      </View>

      {/* Info rows */}
      <View className="mx-4 rounded-2xl overflow-hidden mb-6"
        style={{ backgroundColor: 'rgba(27,32,37,0.70)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' }}>
        {[
          { label: 'Email',        value: user?.email ?? '—' },
          { label: 'Role',         value: profile?.role ?? 'OWNER' },
          { label: 'Plan',         value: planBadge },
          { label: 'Subscription', value: sub?.status === 'active' ? 'Active' : 'Inactive' },
        ].map((row, i, arr) => (
          <View key={row.label}
            className={`flex-row justify-between px-4 py-3.5 ${i < arr.length - 1 ? 'border-b' : ''}`}
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <Text className="text-muted text-sm">{row.label}</Text>
            <Text className="text-on-surface text-sm font-medium">{row.value}</Text>
          </View>
        ))}
      </View>

      {/* Sign out */}
      <TouchableOpacity
        onPress={signOut}
        className="mx-4 rounded-2xl py-3.5 items-center"
        style={{ backgroundColor: 'rgba(255,180,171,0.10)', borderWidth: 1, borderColor: 'rgba(255,180,171,0.25)' }}
      >
        <Text className="text-critical font-semibold">Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

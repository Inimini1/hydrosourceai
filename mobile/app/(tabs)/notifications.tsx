import { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface Notification {
  id: string; type: string; title: string; message: string; read: boolean; created_at: string
}

const TYPE_COLOR: Record<string, string> = {
  UNSAFE_WATER: '#ffb4ab',
  SUBSCRIPTION: '#3cddc7',
  MISSED_TEST:  '#b1c5ff',
}
const TYPE_ICON: Record<string, string> = {
  UNSAFE_WATER: '⚠️',
  SUBSCRIPTION: '💳',
  MISSED_TEST:  '⏰',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function NotificationsScreen() {
  const { user } = useAuth()
  const insets = useSafeAreaInsets()
  const [items, setItems]         = useState<Notification[]>([])
  const [loading, setLoading]     = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function load() {
    const { data } = await supabase
      .from('notifications')
      .select('id, type, title, message, read, created_at')
      .order('created_at', { ascending: false })
      .limit(50)
    setItems((data as Notification[]) ?? [])
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { load() }, [])

  async function markRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
  }

  async function markAllRead() {
    if (!user) return
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const unread = items.filter((n) => !n.read).length

  if (loading) {
    return <View className="flex-1 bg-background items-center justify-center"><ActivityIndicator color="#00f2ff" /></View>
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-4 pb-4">
        <View>
          <Text className="text-on-surface font-bold text-xl">Alerts</Text>
          <Text className="text-muted text-xs mt-0.5">{unread > 0 ? `${unread} unread` : 'All caught up'}</Text>
        </View>
        {unread > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text className="text-safe text-sm font-semibold">Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={(n) => n.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} tintColor="#00f2ff" />}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Text className="text-4xl mb-4">🔔</Text>
            <Text className="text-on-surface font-semibold mb-2">No alerts</Text>
            <Text className="text-muted text-sm text-center">Your pool is healthy. We&apos;ll notify you when attention is needed.</Text>
          </View>
        }
        renderItem={({ item: n }) => {
          const color = TYPE_COLOR[n.type] ?? '#849495'
          const icon  = TYPE_ICON[n.type] ?? 'ℹ️'
          return (
            <TouchableOpacity
              onPress={() => !n.read && markRead(n.id)}
              className="rounded-2xl p-4 flex-row items-start gap-3"
              style={{
                backgroundColor: 'rgba(27,32,37,0.70)',
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
                opacity: n.read ? 0.55 : 1,
              }}
            >
              <View className="w-10 h-10 rounded-2xl items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${color}18` }}>
                <Text style={{ fontSize: 18 }}>{icon}</Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-on-surface text-sm font-semibold">{n.title}</Text>
                  {!n.read && <View className="w-2 h-2 rounded-full" style={{ backgroundColor: '#00f2ff' }} />}
                </View>
                <Text className="text-on-surface-dim text-sm mt-0.5 leading-5">{n.message}</Text>
                <Text className="text-muted text-xs mt-1.5">{formatDate(n.created_at)}</Text>
              </View>
            </TouchableOpacity>
          )
        }}
      />
    </View>
  )
}

import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

const CHLORINE_TYPES = ['CHLORINE', 'SALT', 'BROMINE'] as const

export default function NewPoolScreen() {
  const { user }  = useAuth()
  const router    = useRouter()
  const insets    = useSafeAreaInsets()
  const [name,    setName]    = useState('')
  const [gallons, setGallons] = useState('')
  const [type,    setType]    = useState<typeof CHLORINE_TYPES[number]>('CHLORINE')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function handleCreate() {
    if (!name.trim()) { setError('Pool name is required.'); return }
    const g = parseInt(gallons)
    if (!g || g < 1000 || g > 200000) { setError('Pool size must be 1,000–200,000 gallons.'); return }
    if (!user) { setError('Not signed in.'); return }

    setLoading(true)
    setError(null)

    const { error } = await supabase.from('pools').insert({
      user_id:       user.id,
      pool_name:     name.trim(),
      gallons:       g,
      chlorine_type: type,
    })

    setLoading(false)
    if (error) { setError(error.message); return }
    router.back()
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-background" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 40, paddingHorizontal: 20 }}>
        {/* Header */}
        <View className="flex-row items-center gap-3 mb-8">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-xl items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
            <Text className="text-on-surface text-lg">‹</Text>
          </TouchableOpacity>
          <Text className="text-on-surface font-bold text-xl">Add Pool</Text>
        </View>

        {error && (
          <View className="rounded-2xl px-4 py-3 mb-4 border border-critical" style={{ backgroundColor: 'rgba(147,0,10,0.20)' }}>
            <Text className="text-critical text-sm">{error}</Text>
          </View>
        )}

        {/* Pool name */}
        <Text className="text-on-surface-dim text-xs uppercase tracking-widest font-medium mb-2">Pool Name</Text>
        <TextInput
          className="rounded-2xl px-4 py-4 text-on-surface text-sm mb-5"
          style={{ backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }}
          placeholderTextColor="rgba(185,202,203,0.40)"
          placeholder="Backyard Pool"
          value={name}
          onChangeText={setName}
        />

        {/* Gallons */}
        <Text className="text-on-surface-dim text-xs uppercase tracking-widest font-medium mb-2">Pool Size (gallons)</Text>
        <TextInput
          className="rounded-2xl px-4 py-4 text-on-surface text-sm mb-5"
          style={{ backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }}
          placeholderTextColor="rgba(185,202,203,0.40)"
          placeholder="e.g. 15000"
          value={gallons}
          onChangeText={setGallons}
          keyboardType="number-pad"
        />

        {/* Chlorine type */}
        <Text className="text-on-surface-dim text-xs uppercase tracking-widest font-medium mb-3">Sanitizer Type</Text>
        <View className="flex-row gap-2 mb-8">
          {CHLORINE_TYPES.map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setType(t)}
              className="flex-1 py-3 rounded-xl items-center"
              style={{
                backgroundColor: type === t ? 'rgba(0,242,255,0.15)' : 'rgba(255,255,255,0.06)',
                borderWidth: 1,
                borderColor:     type === t ? 'rgba(0,242,255,0.40)' : 'rgba(255,255,255,0.10)',
              }}
            >
              <Text style={{ color: type === t ? '#00f2ff' : '#849495', fontSize: 12, fontWeight: '600' }}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleCreate}
          disabled={loading}
          className="rounded-2xl py-4 items-center"
          style={{ backgroundColor: loading ? 'rgba(0,242,255,0.30)' : '#00f2ff' }}
        >
          {loading
            ? <ActivityIndicator color="#00363a" />
            : <Text style={{ color: '#00363a', fontWeight: '700', fontSize: 15 }}>Add Pool</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

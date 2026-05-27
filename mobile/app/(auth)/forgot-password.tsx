import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Link } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth()
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)

  async function handleReset() {
    if (!email) return
    setLoading(true)
    await resetPassword(email.trim().toLowerCase())
    setLoading(false)
    setSent(true)
  }

  if (sent) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-4xl mb-4">📬</Text>
        <Text className="text-on-surface font-bold text-xl text-center mb-2">Reset link sent</Text>
        <Text className="text-muted text-sm text-center">Check your email for a password reset link.</Text>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity className="mt-8 rounded-2xl py-3 px-8" style={{ backgroundColor: '#00f2ff' }}>
            <Text style={{ color: '#00363a', fontWeight: '700' }}>Back to Sign In</Text>
          </TouchableOpacity>
        </Link>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background px-6 pt-20">
      <Text className="text-on-surface font-bold text-2xl mb-2">Forgot password?</Text>
      <Text className="text-muted text-sm mb-8">Enter your email and we&apos;ll send a reset link.</Text>

      <Text className="text-on-surface-dim text-xs font-medium uppercase tracking-widest mb-2">Email</Text>
      <TextInput
        className="rounded-2xl px-4 py-4 text-on-surface text-sm mb-6"
        style={{ backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }}
        placeholderTextColor="rgba(185,202,203,0.40)"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity
        onPress={handleReset}
        disabled={loading}
        className="rounded-2xl py-4 items-center"
        style={{ backgroundColor: loading ? 'rgba(0,242,255,0.30)' : '#00f2ff' }}
      >
        {loading ? <ActivityIndicator color="#00363a" /> : <Text style={{ color: '#00363a', fontWeight: '700' }}>Send Reset Link</Text>}
      </TouchableOpacity>

      <Link href="/(auth)/login" asChild>
        <TouchableOpacity className="items-center mt-6">
          <Text className="text-primary text-sm">← Back to Sign In</Text>
        </TouchableOpacity>
      </Link>
    </View>
  )
}

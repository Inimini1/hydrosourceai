import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native'
import { Link } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'

export default function SignupScreen() {
  const { signUp } = useAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [done,     setDone]     = useState(false)

  async function handleSignup() {
    if (!email || !password) { setError('Email and password are required.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    setError(null)
    const { error } = await signUp(email.trim().toLowerCase(), password)
    setLoading(false)
    if (error) { setError(error.message); return }
    setDone(true)
  }

  if (done) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-4xl mb-4">✉️</Text>
        <Text className="text-on-surface font-bold text-xl text-center mb-2">Check your email</Text>
        <Text className="text-muted text-sm text-center leading-relaxed">
          We sent a verification link to {email}. Click it to activate your account, then sign in.
        </Text>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity className="mt-8 rounded-2xl py-3 px-8" style={{ backgroundColor: '#00f2ff' }}>
            <Text style={{ color: '#00363a', fontWeight: '700' }}>Back to Sign In</Text>
          </TouchableOpacity>
        </Link>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-background" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-6 pt-20 pb-10 justify-center">

          <View className="items-center mb-10">
            <View className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
              style={{ backgroundColor: 'rgba(0,242,255,0.10)', borderWidth: 1, borderColor: 'rgba(0,242,255,0.20)' }}>
              <Text className="text-3xl">💧</Text>
            </View>
            <Text className="text-on-surface font-bold text-2xl">Create Account</Text>
            <Text className="text-muted text-sm mt-1">Start monitoring your pool with AI</Text>
          </View>

          {error && (
            <View className="bg-critical-bg border border-critical rounded-2xl px-4 py-3 mb-4">
              <Text className="text-critical text-sm">{error}</Text>
            </View>
          )}

          <View className="mb-4">
            <Text className="text-on-surface-dim text-xs font-medium uppercase tracking-widest mb-2">Email</Text>
            <TextInput
              className="rounded-2xl px-4 py-4 text-on-surface text-sm"
              style={{ backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }}
              placeholderTextColor="rgba(185,202,203,0.40)"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View className="mb-6">
            <Text className="text-on-surface-dim text-xs font-medium uppercase tracking-widest mb-2">Password</Text>
            <TextInput
              className="rounded-2xl px-4 py-4 text-on-surface text-sm"
              style={{ backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }}
              placeholderTextColor="rgba(185,202,203,0.40)"
              placeholder="Min 8 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            onPress={handleSignup}
            disabled={loading}
            className="rounded-2xl py-4 items-center mb-4"
            style={{ backgroundColor: loading ? 'rgba(0,242,255,0.30)' : '#00f2ff' }}
          >
            {loading
              ? <ActivityIndicator color="#00363a" />
              : <Text style={{ color: '#00363a', fontWeight: '700', fontSize: 15 }}>Create Account</Text>
            }
          </TouchableOpacity>

          <View className="flex-row justify-center mt-4">
            <Text className="text-muted text-sm">Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity><Text className="text-primary text-sm font-semibold">Sign In</Text></TouchableOpacity>
            </Link>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

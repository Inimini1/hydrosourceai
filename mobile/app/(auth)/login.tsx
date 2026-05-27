import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native'
import { Link } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'

export default function LoginScreen() {
  const { signIn } = useAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  async function handleLogin() {
    if (!email || !password) { setError('Email and password are required.'); return }
    setLoading(true)
    setError(null)
    const { error } = await signIn(email.trim().toLowerCase(), password)
    setLoading(false)
    if (error) setError('Invalid email or password.')
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-6 pt-20 pb-10 justify-center">

          {/* Logo */}
          <View className="items-center mb-10">
            <View className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
              style={{ backgroundColor: 'rgba(0,242,255,0.10)', borderWidth: 1, borderColor: 'rgba(0,242,255,0.20)' }}>
              <Text className="text-3xl">💧</Text>
            </View>
            <Text className="text-on-surface font-bold text-2xl">SmartPool AI</Text>
            <Text className="text-muted text-sm mt-1">Sign in to your account</Text>
          </View>

          {/* Error */}
          {error && (
            <View className="bg-critical-bg border border-critical rounded-2xl px-4 py-3 mb-4">
              <Text className="text-critical text-sm">{error}</Text>
            </View>
          )}

          {/* Email */}
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
              autoComplete="email"
            />
          </View>

          {/* Password */}
          <View className="mb-6">
            <Text className="text-on-surface-dim text-xs font-medium uppercase tracking-widest mb-2">Password</Text>
            <TextInput
              className="rounded-2xl px-4 py-4 text-on-surface text-sm"
              style={{ backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }}
              placeholderTextColor="rgba(185,202,203,0.40)"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className="rounded-2xl py-4 items-center mb-4"
            style={{ backgroundColor: loading ? 'rgba(0,242,255,0.30)' : '#00f2ff' }}
          >
            {loading
              ? <ActivityIndicator color="#00363a" />
              : <Text style={{ color: '#00363a', fontWeight: '700', fontSize: 15 }}>Sign In</Text>
            }
          </TouchableOpacity>

          {/* Forgot password */}
          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity className="items-center py-2">
              <Text className="text-primary text-sm">Forgot password?</Text>
            </TouchableOpacity>
          </Link>

          {/* Sign up */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-muted text-sm">Don&apos;t have an account? </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text className="text-primary text-sm font-semibold">Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

import { Tabs } from 'expo-router'
import { View, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

function TabIcon({ name, active }: { name: string; active: boolean }) {
  const icons: Record<string, string> = { Home: '⌂', Test: '⚗', Alerts: '🔔', Profile: '◉' }
  return (
    <View className="items-center justify-center">
      {active && (
        <View className="absolute -inset-2 rounded-xl"
          style={{ backgroundColor: 'rgba(0,242,255,0.10)' }} />
      )}
      <Text style={{ fontSize: 18, color: active ? '#00f2ff' : '#849495' }}>{icons[name]}</Text>
    </View>
  )
}

export default function TabLayout() {
  const insets = useSafeAreaInsets()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(10,15,20,0.95)',
          borderTopColor:  'rgba(58,73,75,0.40)',
          borderTopWidth:  1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarActiveTintColor:   '#00f2ff',
        tabBarInactiveTintColor: '#849495',
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '600',
          letterSpacing: 1,
          textTransform: 'uppercase',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon name="Home" active={focused} />,
        }}
      />
      <Tabs.Screen
        name="pools"
        options={{
          title: 'Test',
          tabBarIcon: ({ focused }) => <TabIcon name="Test" active={focused} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ focused }) => <TabIcon name="Alerts" active={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon name="Profile" active={focused} />,
        }}
      />
    </Tabs>
  )
}

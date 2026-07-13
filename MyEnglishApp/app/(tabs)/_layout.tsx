import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';

import { Theme } from '@/constants/Theme';

export default function TabLayout() {
  return <Tabs screenOptions={{
    headerShown: false,
    tabBarActiveTintColor: Theme.colors.greenDark,
    tabBarInactiveTintColor: Theme.colors.muted,
    tabBarLabelStyle: { fontSize: 11, fontWeight: '800' },
    tabBarStyle: { height: 68, paddingTop: 7, paddingBottom: 9, borderTopColor: Theme.colors.border, backgroundColor: '#FFFFFF' },
  }}>
    <Tabs.Screen name="index" options={{ title: 'Học', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="map-marker-path" color={color} size={size} /> }} />
    <Tabs.Screen name="review" options={{ title: 'Ôn tập', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="brain" color={color} size={size} /> }} />
    <Tabs.Screen name="profile" options={{ title: 'Của bé', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account-circle" color={color} size={size} /> }} />
  </Tabs>;
}

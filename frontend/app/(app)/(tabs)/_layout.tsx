import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MyDarkTheme } from '@/assets/theme';

export default function TabsLayout() {
	return (
		<Tabs
			screenOptions={{
				tabBarStyle: { backgroundColor: MyDarkTheme.colors.card },
				tabBarActiveTintColor: MyDarkTheme.colors.primary,
				tabBarInactiveTintColor: '#aaa',
				headerStyle: { backgroundColor: MyDarkTheme.colors.card },
				headerTintColor: 'white',
				tabBarLabelStyle: { fontSize: 12 },
				
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: 'Home',
					tabBarIcon: ({ color }) => (
						<Ionicons name="home" size={24} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="history"
				options={{
					title: 'History',
					tabBarIcon: ({ color }) => (
						<Ionicons name="time" size={24} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="account"
				options={{
					title: 'Account',
					tabBarIcon: ({ color }) => (
						<Ionicons name="person" size={24} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}

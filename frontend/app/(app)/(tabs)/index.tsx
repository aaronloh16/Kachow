import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSession } from '../../../ctx';

export default function HomeScreen() {
	const { signOut, session } = useSession();

	
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Hi {session?.displayName}!</Text>
			<Text style={styles.title}>Welcome to Kachow!</Text>
			<Text style={styles.subtitle}>Ready to identify some cars?</Text>

			<TouchableOpacity
				style={styles.cameraButton}
				onPress={() => {
					// This will navigate to the camera screen once we create it
					// router.push('/camera');
					alert('Camera functionality coming soon!');
				}}
			>
				<Text style={styles.buttonText}>Take Photo</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={styles.signOutButton}
				onPress={() => {
					signOut();
					// The _layout.tsx in (app) will handle the redirect to sign-in
				}}
			>
				<Text style={styles.signOutText}>Sign Out</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 10,
	},
	subtitle: {
		fontSize: 16,
		marginBottom: 30,
		color: '#666',
	},
	cameraButton: {
		backgroundColor: '#f44336',
		paddingVertical: 12,
		paddingHorizontal: 30,
		borderRadius: 8,
		marginBottom: 20,
	},
	buttonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: 'bold',
	},
	signOutButton: {
		marginTop: 20,
	},
	signOutText: {
		color: '#f44336',
		fontSize: 14,
	},
});

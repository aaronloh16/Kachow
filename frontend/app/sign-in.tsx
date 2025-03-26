import { router } from 'expo-router';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';

import { useSession } from '../ctx';

export default function SignIn() {
	const { signIn } = useSession();

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Kachow Car Identification</Text>
			<Text style={styles.subtitle}>Identify cars like never before!</Text>

			<TouchableOpacity
				style={styles.button}
				onPress={() => {
					signIn();
					// Navigate after signing in
					router.replace('/');
				}}
			>
				<Text style={styles.buttonText}>Sign In</Text>
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
		backgroundColor: '#fff',
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 10,
		color: '#666',
	},
	subtitle: {
		fontSize: 16,
		marginBottom: 30,
		color: '#666',
	},
	button: {
		backgroundColor: '#f44336',
		paddingVertical: 12,
		paddingHorizontal: 30,
		borderRadius: 8,
	},
	buttonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: 'bold',
	},
});

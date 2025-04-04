import { useState } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useSession } from '../ctx';
import { router } from 'expo-router';

export default function SignIn() {
	const { signIn } = useSession();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	const handleLogin = async () => {
		try {
			await signIn(email, password);
			router.replace('/');
		} catch (err: any) {
			setError(err.message);
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Kachow Car Identification</Text>
			<Text style={styles.subtitle}>Identify cars like never before!</Text>

			<TextInput
				style={styles.input}
				placeholder="Email"
				autoCapitalize="none"
				onChangeText={setEmail}
				value={email}
			/>

			<TextInput
				style={styles.input}
				placeholder="Password"
				secureTextEntry
				onChangeText={setPassword}
				value={password}
			/>

			{error ? <Text style={styles.error}>{error}</Text> : null}

			<TouchableOpacity style={styles.button} onPress={handleLogin}>
				<Text style={styles.buttonText}>Sign In</Text>
			</TouchableOpacity>

			<TouchableOpacity onPress={() => router.push('/sign-up')}>
				<Text style={styles.link}>Don't have an account? Sign up</Text>
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
	input: {
		width: '100%',
		height: 50,
		borderColor: '#ccc',
		borderWidth: 1,
		borderRadius: 5,
		paddingHorizontal: 10,
		marginBottom: 15,
	},
	error: {
		color: 'red',
		marginBottom: 10,
	},
	button: {
		backgroundColor: '#f44336',
		paddingVertical: 12,
		paddingHorizontal: 30,
		borderRadius: 8,
		marginBottom: 10,
	},
	buttonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: 'bold',
	},
	link: {
		color: '#2196F3',
		fontSize: 14,
		marginTop: 10,
	},
});

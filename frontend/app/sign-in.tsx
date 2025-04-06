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
		backgroundColor: '#000', // Instagram dark background
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 10,
		color: '#fff', // white text for dark bg
	},
	subtitle: {
		fontSize: 16,
		marginBottom: 30,
		color: '#aaa', // muted gray
	},
	input: {
		width: '100%',
		height: 50,
		borderColor: '#333', // dark border
		borderWidth: 1,
		borderRadius: 10,
		paddingHorizontal: 15,
		marginBottom: 15,
		backgroundColor: '#121212', // dark input bg
		color: '#fff',
	},
	error: {
		color: '#f44336',
		marginBottom: 10,
		fontSize: 14,
	},
	button: {
		backgroundColor: '#f44336', // bold red for primary action
		paddingVertical: 12,
		paddingHorizontal: 30,
		borderRadius: 8,
		marginBottom: 10,
	},
	buttonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
	link: {
		color: '#3797EF', // Instagram link blue
		fontSize: 14,
		marginTop: 10,
	},
});

import { useState } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useSession } from '../ctx';
import { router } from 'expo-router';

export default function SignUp() {
	const { signUp } = useSession();

	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	const handleSignUp = async () => {
		try {
			const fullName = `${firstName} ${lastName}`;
			await signUp(email, password, fullName);
			router.replace('/');
		} catch (err: any) {
			setError(err.message);
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Create Your Account</Text>

			<TextInput
				style={styles.input}
				placeholder="First Name"
				onChangeText={setFirstName}
				value={firstName}
			/>
			<TextInput
				style={styles.input}
				placeholder="Last Name"
				onChangeText={setLastName}
				value={lastName}
			/>
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

			<TouchableOpacity style={styles.button} onPress={handleSignUp}>
				<Text style={styles.buttonText}>Sign Up</Text>
			</TouchableOpacity>

			<TouchableOpacity onPress={() => router.push('/sign-in')}>
				<Text style={styles.link}>Already have an account? Sign in</Text>
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
		marginBottom: 20,
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
		backgroundColor: '#4CAF50',
		paddingVertical: 12,
		paddingHorizontal: 30,
		borderRadius: 8,
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

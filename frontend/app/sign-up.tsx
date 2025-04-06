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
		backgroundColor: '#000', // Instagram dark background
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 20,
		color: '#fff', // white title
	},
	input: {
		width: '100%',
		height: 50,
		borderColor: '#333', // darker border for contrast
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
		backgroundColor: '#f44336', // consistent primary color
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
import { useState } from 'react';
import {
	Text,
	View,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	ImageBackground,
	SafeAreaView,
	ActivityIndicator,
} from 'react-native';
import { useFonts } from 'expo-font';
import { useSession } from '../../ctx';
import { router } from 'expo-router';

const backgroundImage = require('../../assets/images/background.jpg');

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
		<ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
			<SafeAreaView style={{ flex: 1 }}>
				<View style={styles.container}>
					<Text style={styles.kachowTitle}>KACHOW</Text>
					<Text style={styles.subtitle}>Identify cars like never before!</Text>

					<TextInput
						style={styles.input}
						placeholder="Email"
						placeholderTextColor="#777"
						autoCapitalize="none"
						onChangeText={setEmail}
						value={email}
					/>

					<TextInput
						style={styles.input}
						placeholder="Password"
						placeholderTextColor="#777"
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
			</SafeAreaView>
		</ImageBackground>
	);
}

const styles = StyleSheet.create({
	background: { flex: 1, width: '100%', height: '100%' },
	loaderContainer: {
		flex: 1,
		backgroundColor: 'black',
		justifyContent: 'center',
		alignItems: 'center',
	},
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	kachowTitle: {
		fontSize: 42,
		fontFamily: 'Orbitron',
		color: '#fff',
		marginBottom: 8,
		letterSpacing: 3,
		textShadowColor: '#f44336',
		textShadowOffset: { width: 2, height: 2 },
		textShadowRadius: 4,
	},
	subtitle: {
		fontSize: 16,
		marginBottom: 30,
		color: '#aaa',
	},
	input: {
		width: '100%',
		height: 50,
		borderColor: '#333',
		borderWidth: 1,
		borderRadius: 10,
		paddingHorizontal: 15,
		marginBottom: 15,
		backgroundColor: '#121212',
		color: '#fff',
	},
	error: {
		color: '#f44336',
		marginBottom: 10,
		fontSize: 14,
	},
	button: {
		backgroundColor: '#f44336',
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
		color: '#3797EF',
		fontSize: 14,
		marginTop: 10,
		marginBottom: 300,
	},
});

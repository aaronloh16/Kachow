// app/(app)/(tabs)/account.tsx
import { useCallback, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // adjust import path as needed
import { useSession } from '../../../ctx';
import { router, useFocusEffect } from 'expo-router';

export default function AccountScreen() {
	const { session, refreshSession} = useSession();
	const user = auth.currentUser;

	const [displayName, setDisplayName] = useState(user?.displayName || '');
	const [email, setEmail] = useState(user?.email || '');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSave = async () => {
		if (!user) return;

		setLoading(true);
		try {
			if (displayName !== user.displayName) {
				await updateProfile(user, { displayName });
			}
			if (email !== user.email) {
				await updateEmail(user, email);
			}
			if (password.length > 5) {
				await updatePassword(user, password);
			}

			await refreshSession();

			Alert.alert(
                'Profile Updated',
                'Your account has been successfully updated.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      router.replace('/'); // navigate to home
                    },
                  },
                ],
                { cancelable: false }
              );
		} catch (error: any) {
			console.error(error);
			Alert.alert('Error', error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Account Settings</Text>

			<Text style={styles.label}>Display Name</Text>
			<TextInput
				style={styles.input}
				value={displayName}
				onChangeText={setDisplayName}
			/>

			<Text style={styles.label}>Email</Text>
			<TextInput
				style={styles.input}
				value={email}
				onChangeText={setEmail}
				autoCapitalize="none"
			/>

			<Text style={styles.label}>New Password</Text>
			<TextInput
				style={styles.input}
				value={password}
				onChangeText={setPassword}
				secureTextEntry
				placeholder="Leave blank to keep current password"
			/>

			<TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
				<Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: 'black',
	},
	title: {
		fontSize: 22,
		fontWeight: 'bold',
		marginBottom: 20,
		color: 'white',
	},
	label: {
		fontSize: 16,
		color: '#ccc',
		marginBottom: 5,
	},
	input: {
		backgroundColor: '#1a1a1a',
		borderWidth: 1,
		borderColor: '#333',
		color: 'white',
		padding: 10,
		borderRadius: 6,
		marginBottom: 15,
	},
	button: {
		backgroundColor: '#f44336',
		padding: 12,
		borderRadius: 6,
		alignItems: 'center',
	},
	buttonText: {
		color: 'white',
		fontWeight: 'bold',
		fontSize: 16,
	},
});

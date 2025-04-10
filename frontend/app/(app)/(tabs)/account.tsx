// app/(app)/(tabs)/account.tsx
import { useCallback, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // adjust import path as needed
import { useSession } from '../../../ctx';
import { router } from 'expo-router';

export default function AccountScreen() {
	const { session, refreshSession } = useSession();
	const user = auth.currentUser;

	const [displayName, setDisplayName] = useState(user?.displayName || '');
	const [email, setEmail] = useState(user?.email || '');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);

	const [currentPasswordModalVisible, setCurrentPasswordModalVisible] = useState(false);
	const [currentPassword, setCurrentPassword] = useState('');

	const handleSave = async () => {
		if (!user || !user.email) return;

		setLoading(true);
		try {
			// Prevent email from being changed
			if (email !== user.email) {
				Alert.alert('Email Change Not Allowed', 'Changing your email is currently disabled.');
				setEmail(user.email); // reset
			}

			if (displayName !== user.displayName) {
				await updateProfile(user, { displayName });
			}

			if (password.length > 5) {
				// Show modal to get current password
				setCurrentPasswordModalVisible(true);
				setLoading(false); // Pause until modal is submitted
				return;
			}

			await refreshSession();

			Alert.alert('Profile Updated', 'Your account has been successfully updated.', [
				{ text: 'OK', onPress: () => router.replace('/') },
			]);
		} catch (error: any) {
			console.error(error);
			Alert.alert('Error', error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleConfirmPasswordChange = async () => {
		if (!user || !user.email || currentPassword.length < 6) {
			Alert.alert('Error', 'Please enter your current password.');
			return;
		}

		setLoading(true);
		try {
			const credential = EmailAuthProvider.credential(user.email, currentPassword);
			await reauthenticateWithCredential(user, credential);
			await updatePassword(user, password);
			await refreshSession();

			Alert.alert('Password Updated', 'Your password has been successfully changed.', [
				{ text: 'OK', onPress: () => router.replace('/') },
			]);
		} catch (error: any) {
			console.error(error);
			Alert.alert('Error', error.message);
		} finally {
			setLoading(false);
			setCurrentPassword('');
			setPassword('');
			setCurrentPasswordModalVisible(false);
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
				style={[styles.input, { opacity: 0.6 }]}
				value={email}
				editable={false}
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

			{/* Current Password Modal */}
			<Modal
				animationType="slide"
				transparent={true}
				visible={currentPasswordModalVisible}
				onRequestClose={() => setCurrentPasswordModalVisible(false)}
			>
				<View style={styles.modalBackground}>
					<View style={styles.modalContainer}>
						<Text style={styles.modalTitle}>Enter Current Password</Text>
						<TextInput
							style={styles.input}
							secureTextEntry
							placeholder="Current Password"
							placeholderTextColor="#888"
							value={currentPassword}
							onChangeText={setCurrentPassword}
						/>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
							<TouchableOpacity
								style={[styles.button, { backgroundColor: '#555', flex: 1, marginRight: 10 }]}
								onPress={() => {
									setCurrentPasswordModalVisible(false);
									setCurrentPassword('');
								}}
							>
								<Text style={styles.buttonText}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.button, { flex: 1 }]}
								onPress={handleConfirmPasswordChange}
							>
								<Text style={styles.buttonText}>Confirm</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
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
	modalBackground: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0,0,0,0.7)',
	},
	modalContainer: {
		backgroundColor: '#222',
		padding: 20,
		borderRadius: 10,
		width: '80%',
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: 'white',
		marginBottom: 10,
	},
});

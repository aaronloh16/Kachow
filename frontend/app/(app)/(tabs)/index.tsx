import { Text, View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToFirebase } from '../../../lib/image/upload';
import { useSession } from '../../../ctx';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { useState } from 'react';

export default function HomeScreen() {
	const { signOut, session } = useSession();
	const [loading, setLoading] = useState(false);
	const [loadingMessage, setLoadingMessage] = useState('Processing image...');

	const handlePickAndUpload = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			quality: 1,
		});

		if (!result.canceled && result.assets.length > 0) {
			const imageUri = result.assets[0].uri;
			try {
				setLoading(true);
				setLoadingMessage('Uploading image...');

				// const firebaseUrl = await uploadImageToFirebase(imageUri);
				// console.log('Uploaded to:', firebaseUrl);
				Alert.alert('Image uploaded successfully');

				setLoadingMessage('Consulting the experts...');

				//Call Flask backend with that image URL
				const res = await fetch('http://localhost:5001/identify', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						image_url:
							'https://firebasestorage.googleapis.com/v0/b/kachow-6cbae.firebasestorage.app/o/uploads%2F1743551856537.jpg?alt=media&token=dbf69be1-d9f2-4999-8827-a0c9ec71831a',
					}),
				});

				const data = await res.json();
				console.log('Response from backend:', data);
				//Alert.alert('Result', data?.final_result || 'Check console for full response');
				setLoading(false);
				Alert.alert('Success');
			} catch (err) {
				console.error(err);
				setLoading(false);
				Alert.alert('Upload failed', 'Could not identify the image.');
			}
		}
	};

	return (
		<View style={styles.container}>
			{/* Loading overlay */}
			<LoadingOverlay visible={loading} message={loadingMessage} />

			<Text style={styles.title}>Hi {session?.displayName}!</Text>
			<Text style={styles.title}>Welcome to Kachow!</Text>
			<Text style={styles.subtitle}>Ready to identify some cars?</Text>

			<TouchableOpacity
				style={styles.cameraButton}
				onPress={handlePickAndUpload}
			>
				<Text style={styles.buttonText}>Upload Car Photo</Text>
			</TouchableOpacity>

			<TouchableOpacity style={styles.signOutButton} onPress={signOut}>
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

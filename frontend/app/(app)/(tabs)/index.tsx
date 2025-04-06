import {
	Text,
	View,
	StyleSheet,
	TouchableOpacity,
	Alert,
	Modal,
	TextInput,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToFirebase } from '../../../lib/image/upload';
import { useSession } from '../../../ctx';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { useState } from 'react';
import { ImagePickerAsset } from 'expo-image-picker';

export default function HomeScreen() {
	const { signOut, session } = useSession();
	const [loading, setLoading] = useState(false);
	const [loadingMessage, setLoadingMessage] = useState('Processing image...');
	const [image, setImage] = useState<ImagePickerAsset | null>(null);
	const [showGuessModal, setShowGuessModal] = useState(false);
	const [makeGuess, setMakeGuess] = useState('');
	const [modelGuess, setModelGuess] = useState('');

	const handleImagePick = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			quality: 1,
		});

		if (!result.canceled && result.assets.length > 0) {
			setImage(result.assets[0]);
			// Show the guess modal to let the user enter their guess
			setShowGuessModal(true);
		}
	};

	const handleSubmitGuess = async () => {
		setShowGuessModal(false);

		if (!image) return;

		const imageUri = image.uri;
		const userGuess = {
			make: makeGuess.trim(),
			model: modelGuess.trim(),
		};
		try {
			router.push('/loading');
			const firebaseUrl = await uploadImageToFirebase(imageUri);
			console.log('Uploaded to:', firebaseUrl);

			// Call Flask backend with that image URL
			const res = await fetch('http://localhost:5001/identify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					image_url: firebaseUrl,
					user_id: session?.uid,
					user_guess: userGuess
				}),
			});

			const data = await res.json();
			console.log('Response from backend:', data);

			

			// Navigate to results page with the data and user guess
			if (data.doc_id) {
				router.push(`/result/${data.doc_id}` as any);
				  
			} else {
				throw new Error('No doc_id returned');
			}

			// Reset the form
			setMakeGuess('');
			setModelGuess('');
			setImage(null);
			setLoading(false);
		} catch (err) {
			console.error(err);
			setLoading(false);
			Alert.alert('Upload failed', 'Could not identify the image.');
		}
	};

	const handleSkipGuess = () => {
		setShowGuessModal(false);

		// Package an empty guess
		const userGuess = {
			make: '',
			model: '',
		};

		// Proceed with the image processing
		if (image) {
			handleSubmitGuess();
		}
	};

	return (
		<View style={styles.container}>
			{/* Loading overlay */}
			<LoadingOverlay visible={loading} message={loadingMessage} />

			{/* Guess Modal */}
			<Modal
				visible={showGuessModal}
				transparent={true}
				animationType="slide"
				onRequestClose={() => setShowGuessModal(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>
							What car do you think this is?
						</Text>

						<Text style={styles.inputLabel}>Make</Text>
						<TextInput
							style={styles.input}
							placeholder="e.g. Toyota, Honda, BMW"
							value={makeGuess}
							onChangeText={setMakeGuess}
							autoCapitalize="words"
						/>

						<Text style={styles.inputLabel}>Model</Text>
						<TextInput
							style={styles.input}
							placeholder="e.g. Camry, Civic, M3"
							value={modelGuess}
							onChangeText={setModelGuess}
							autoCapitalize="words"
						/>

						<View style={styles.modalButtons}>
							<TouchableOpacity
								style={[styles.modalButton, styles.skipButton]}
								onPress={handleSkipGuess}
							>
								<Text style={styles.skipButtonText}>Skip</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={[styles.modalButton, styles.submitButton]}
								onPress={handleSubmitGuess}
							>
								<Text style={styles.submitButtonText}>Submit</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>

			<Text style={styles.title}>Hi {session?.displayName}!</Text>
			<Text style={styles.title}>Welcome to Kachow!</Text>
			<Text style={styles.subtitle}>Ready to identify some cars?</Text>

			<TouchableOpacity style={styles.cameraButton} onPress={handleImagePick}>
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
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalContent: {
		backgroundColor: 'white',
		width: '80%',
		borderRadius: 10,
		padding: 20,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 20,
		textAlign: 'center',
	},
	inputLabel: {
		fontSize: 14,
		marginBottom: 5,
		fontWeight: '500',
	},
	input: {
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 5,
		padding: 10,
		marginBottom: 15,
	},
	modalButtons: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 10,
	},
	modalButton: {
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 5,
		minWidth: 100,
		alignItems: 'center',
	},
	skipButton: {
		backgroundColor: '#f5f5f5',
	},
	skipButtonText: {
		color: '#666',
	},
	submitButton: {
		backgroundColor: '#f44336',
	},
	submitButtonText: {
		color: 'white',
		fontWeight: 'bold',
	},
});

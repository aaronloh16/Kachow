import {
	Text,
	View,
	StyleSheet,
	TouchableOpacity,
	Alert,
	Modal,
	TextInput,
	ImageBackground,
	SafeAreaView,
	ScrollView,
	ActivityIndicator,
} from 'react-native';
import { useFonts } from 'expo-font';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToFirebase } from '../../../lib/image/upload';
import { useSession } from '../../../ctx';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { useState } from 'react';
import { ImagePickerAsset } from 'expo-image-picker';

const backgroundImage = require('../../../assets/images/background.jpg');

export default function HomeScreen() {
	const { signOut, session } = useSession();
	const [loading, setLoading] = useState(false);
	const [loadingMessage, setLoadingMessage] = useState('Processing image...');
	const [image, setImage] = useState<ImagePickerAsset | null>(null);
	const [showGuessModal, setShowGuessModal] = useState(false);
	const [makeGuess, setMakeGuess] = useState('');
	const [modelGuess, setModelGuess] = useState('');

	const [fontsLoaded] = useFonts({
		Orbitron: require('../../../assets/fonts/Orbitron-VariableFont_wght.ttf'),
	});

	// Show fallback loader while waiting for font and auth session
	if (!fontsLoaded || session === undefined) {
		return (
			<View style={styles.loaderContainer}>
				<ActivityIndicator size="large" color="#f44336" />
			</View>
		);
	}

	if (session === null) return null;

	const handleImagePick = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			quality: 1,
		});
		if (!result.canceled && result.assets.length > 0) {
			setImage(result.assets[0]);
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
			const res = await fetch('http://localhost:5001/identify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					image_url: firebaseUrl,
					user_id: session?.uid,
					user_guess: userGuess,
				}),
			});

			const data = await res.json();
			if (data.doc_id) {
				router.push(`/result/${data.doc_id}` as any);
			} else {
				throw new Error('No doc_id returned');
			}

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
		if (image) {
			handleSubmitGuess();
		}
	};

	return (
		<ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
			<SafeAreaView style={{ flex: 1 }}>
				<ScrollView contentContainerStyle={styles.scrollContainer}>
					<LoadingOverlay visible={loading} message={loadingMessage} />

					<Modal
						visible={showGuessModal}
						transparent
						animationType="slide"
						onRequestClose={() => setShowGuessModal(false)}
					>
						<View style={styles.modalOverlay}>
							<View style={styles.modalContent}>
								<Text style={styles.modalTitle}>What car do you think this is?</Text>

								<Text style={styles.inputLabel}>Make</Text>
								<TextInput
									style={styles.input}
									placeholder="e.g. Toyota, Honda, BMW"
									value={makeGuess}
									onChangeText={setMakeGuess}
									autoCapitalize="words"
									placeholderTextColor="#777"
								/>

								<Text style={styles.inputLabel}>Model</Text>
								<TextInput
									style={styles.input}
									placeholder="e.g. Camry, Civic, M3"
									value={modelGuess}
									onChangeText={setModelGuess}
									autoCapitalize="words"
									placeholderTextColor="#777"
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

					<Text style={styles.kachowTitle}>Welcome, {session?.displayName}!</Text>

					<TouchableOpacity style={styles.cameraButton} onPress={handleImagePick}>
						<Text style={styles.buttonText}>Upload Car Photo</Text>
					</TouchableOpacity>

					<TouchableOpacity style={styles.signOutButton} onPress={signOut}>
						<Text style={styles.signOutText}>Sign Out</Text>
					</TouchableOpacity>
				</ScrollView>
			</SafeAreaView>
		</ImageBackground>
	);
}

const styles = StyleSheet.create({
	background: { flex: 1, width: '100%', height: '100%' },
	scrollContainer: {
		flexGrow: 1,
		justifyContent: 'flex-start',
		alignItems: 'center',
		paddingTop: 60,
		paddingHorizontal: 24,
	},
	loaderContainer: {
		flex: 1,
		backgroundColor: 'black',
		justifyContent: 'center',
		alignItems: 'center',
	},
	kachowTitle: {
		fontSize: 36,
		fontFamily: 'Orbitron',
		color: '#fff',
		marginBottom: 40,
		textAlign: 'center',
	},
	cameraButton: {
		backgroundColor: '#f44336',
		paddingVertical: 14,
		paddingHorizontal: 40,
		borderRadius: 12,
		marginBottom: 16,
		width: '100%',
		alignItems: 'center',
	},
	buttonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
	signOutButton: {
		marginTop: 20,
	},
	signOutText: {
		color: '#f44336',
		fontSize: 14,
		textDecorationLine: 'underline',
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.6)',
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 16,
	},
	modalContent: {
		backgroundColor: '#1c1c1c',
		width: '100%',
		borderRadius: 16,
		padding: 24,
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 20,
		textAlign: 'center',
		color: '#fff',
	},
	inputLabel: {
		fontSize: 14,
		marginBottom: 6,
		fontWeight: '500',
		color: '#ccc',
	},
	input: {
		borderWidth: 1,
		borderColor: '#444',
		borderRadius: 8,
		padding: 12,
		marginBottom: 16,
		color: '#fff',
		backgroundColor: '#2a2a2a',
	},
	modalButtons: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 10,
	},
	modalButton: {
		flex: 1,
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: 'center',
		marginHorizontal: 5,
	},
	skipButton: {
		backgroundColor: '#444',
	},
	skipButtonText: {
		color: '#ccc',
		fontWeight: '600',
	},
	submitButton: {
		backgroundColor: '#f44336',
	},
	submitButtonText: {
		color: '#fff',
		fontWeight: 'bold',
	},
});

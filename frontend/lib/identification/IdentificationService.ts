import {
	collection,
	addDoc,
	query,
	where,
	orderBy,
	getDocs,
	doc,
	getDoc,
	serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { uploadImageToFirebase } from '../image/upload';

export type UserGuess = {
	make: string;
	model: string;
};

export type IdentificationResult = {
	aggregated: any;
	openai: any;
	gemini: any;
	custom_model: any;
	process: string;
};

export type IdentificationRecord = {
	id: string;
	timestamp: any;
	imageUrl: string;
	userGuess: UserGuess;
	correctGuess: boolean;
	results: IdentificationResult;
};

/**
 * Save a car identification to Firestore
 */
export async function saveIdentification(
	userId: string,
	imageUri: string,
	userGuess: UserGuess,
	results: IdentificationResult
): Promise<string> {
	try {
		// Upload the image to Firebase Storage
		const imageUrl = await uploadImageToFirebase(imageUri);

		// Check if the user's guess was correct
		const isCorrect = checkGuessAccuracy(userGuess, results.aggregated);

		// Create the record in Firestore
		const docRef = await addDoc(
			collection(db, `users/${userId}/identifications`),
			{
				timestamp: serverTimestamp(),
				imageUrl,
				userGuess,
				correctGuess: isCorrect,
				results,
			}
		);

		return docRef.id;
	} catch (error) {
		console.error('Error saving identification:', error);
		throw error;
	}
}

/**
 * Get all identification history for a user
 */
export async function getUserIdentificationHistory(
	userId: string
): Promise<any[]> {
	try {
		const q = query(
			collection(db, `users/${userId}/identifications`),
			orderBy('timestamp', 'desc')
		);

		const querySnapshot = await getDocs(q);
		const history: any[] = [];

		querySnapshot.forEach((doc) => {
			const data = doc.data();
			history.push({
				id: doc.id,
				timestamp: data.timestamp,
				imageUrl: data.image_url,
				userGuess: data.user_guess,
				correctGuess: data.correctGuess,
				results: data.results,
			});
		});

		return history;
	} catch (error) {
		console.error('Error fetching identification history:', error);
		throw error;
	}
}

/**
 * Get a specific identification by ID
 */
export async function getIdentificationById(
	userId: string,
	identificationId: string
): Promise<IdentificationRecord | null> {
	try {
		const docRef = doc(
			db,
			`users/${userId}/identifications/${identificationId}`
		);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			const data = docSnap.data();
			return {
				id: docSnap.id,
				timestamp: data.timestamp,
				imageUrl: data.image_url,
				userGuess: data.user_guess,
				correctGuess: data.correctGuess,
				results: data.results,
			};
		}

		return null;
	} catch (error) {
		console.error('Error fetching identification:', error);
		throw error;
	}
}

/**
 * Check if user's guess matches the identified car
 */
function checkGuessAccuracy(
	userGuess: UserGuess,
	result: { make: string; model: string }
): boolean {
	// Simple string matching (case insensitive)
	const makeCorrect =
		userGuess.make.toLowerCase() === result.make.toLowerCase();
	const modelCorrect =
		userGuess.model.toLowerCase() === result.model.toLowerCase();

	// Could make this more sophisticated with fuzzy matching, but this is a start
	return makeCorrect && modelCorrect;
}

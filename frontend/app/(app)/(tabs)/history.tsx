import {
	Text,
	View,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	Image,
} from 'react-native';
import { useSession } from '../../../ctx';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { getUserIdentificationHistory } from '@/lib/identification/IdentificationService';

// Define types for our mock data
type UserGuess = {
	make: string;
	model: string;
};

type ResultData = {
	make: string;
	model: string;
	year: string;
	confidence: string;
	details: string;
};

type IdentificationResult = {
	aggregated: ResultData;
	process: string;
	openai: ResultData | { first_round: ResultData; second_round: ResultData };
	gemini: ResultData | { first_round: ResultData; second_round: ResultData };
	custom_model: ResultData;
};

type IdentificationRecord = {
	id: string;
	timestamp: Date;
	imageUrl: string;
	userGuess: UserGuess;
	correctGuess: boolean;
	results: IdentificationResult;
};

// Mock data for history
const MOCK_HISTORY: IdentificationRecord[] = [
	{
		id: '1',
		timestamp: new Date(2023, 11, 15),
		imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d',
		userGuess: { make: 'Ferrari', model: '458' },
		correctGuess: false,
		results: {
			aggregated: {
				make: 'Lamborghini',
				model: 'Huracan',
				year: '2020',
				confidence: 'high',
				details: 'Yellow sports car with distinctive Lamborghini styling.',
			},
			process: 'single_round',
			openai: {
				make: 'Lamborghini',
				model: 'Huracan',
				year: '2020',
				confidence: 'high',
				details: 'Yellow sports car with distinctive Lamborghini styling.',
			},
			gemini: {
				make: 'Lamborghini',
				model: 'Huracan',
				year: '2020',
				confidence: 'high',
				details: 'Mid-engine sports car with V10 engine.',
			},
			custom_model: {
				make: 'Lamborghini',
				model: 'Huracan',
				year: '2020',
				confidence: 'medium',
				details: 'Sports car with angular styling.',
			},
		},
	},
	{
		id: '2',
		timestamp: new Date(2023, 11, 10),
		imageUrl: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8',
		userGuess: { make: 'Ford', model: 'Mustang' },
		correctGuess: true,
		results: {
			aggregated: {
				make: 'Ford',
				model: 'Mustang',
				year: '2018',
				confidence: 'high',
				details: 'Classic American muscle car with iconic styling.',
			},
			process: 'single_round',
			openai: {
				make: 'Ford',
				model: 'Mustang',
				year: '2018',
				confidence: 'high',
				details: 'Classic American muscle car with iconic styling.',
			},
			gemini: {
				make: 'Ford',
				model: 'Mustang',
				year: '2019',
				confidence: 'medium',
				details: 'American sports car with V8 engine.',
			},
			custom_model: {
				make: 'Ford',
				model: 'Mustang',
				year: '2018',
				confidence: 'high',
				details: 'Muscle car with distinctive front grille.',
			},
		},
	},
	{
		id: '3',
		timestamp: new Date(2023, 11, 5),
		imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888',
		userGuess: { make: 'Toyota', model: 'Camry' },
		correctGuess: false,
		results: {
			aggregated: {
				make: 'Honda',
				model: 'Accord',
				year: '2021',
				confidence: 'high',
				details: 'Midsize sedan with Honda styling cues and chrome grille.',
			},
			process: 'blackboard_two_rounds',
			openai: {
				first_round: {
					make: 'Toyota',
					model: 'Camry',
					year: '2021',
					confidence: 'medium',
					details: 'Midsize sedan with modern styling.',
				},
				second_round: {
					make: 'Honda',
					model: 'Accord',
					year: '2021',
					confidence: 'high',
					details: 'Midsize sedan with Honda styling cues and chrome grille.',
				},
			},
			gemini: {
				first_round: {
					make: 'Hyundai',
					model: 'Sonata',
					year: '2020',
					confidence: 'low',
					details: 'Sedan with sleek styling.',
				},
				second_round: {
					make: 'Honda',
					model: 'Accord',
					year: '2021',
					confidence: 'high',
					details: "Honda's flagship sedan with distinctive LED headlights.",
				},
			},
			custom_model: {
				make: 'Honda',
				model: 'Accord',
				year: '2021',
				confidence: 'medium',
				details: 'Sedan with Honda badge.',
			},
		},
	},
];

// Function to check if user's guess matches the identified car
function checkGuessAccuracy(
	userGuess: UserGuess | undefined | null,
	result: { make: string; model: string } | undefined | null
): boolean {
	if (!userGuess || !result || !userGuess.make || !userGuess.model) {
		return false;
	}

	// Simple string matching (case insensitive)
	const makeCorrect =
		userGuess.make.toLowerCase() === result.make.toLowerCase();
	const modelCorrect =
		userGuess.model.toLowerCase() === result.model.toLowerCase();

	return makeCorrect && modelCorrect;
}

export default function HistoryScreen() {
	const { session } = useSession();

	// Using mock data directly instead of fetching from Firestore
	const [history, setHistory] = useState<any[]>([]);

	useEffect(() => {
		if (!session?.uid) return;

		const fetchHistory = async () => {
			try {
				const records = await getUserIdentificationHistory(session.uid);
				setHistory(records);
			} catch (error) {
				console.error('Failed to load history:', error);
			}
		};

		fetchHistory();
		console.log(history);
	}, [session?.uid]);

	const handleItemPress = (item: any) => {
		router.push(`/result/${item.id}`);
	};

	const formatDate = (timestamp: any) => {
		const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	// Determine if a guess is correct based on real-time calculation or stored value
	const isGuessCorrect = (item: any) => {
		// Calculate correctness in real-time using same logic as result page
		const calculatedCorrectness = checkGuessAccuracy(
			item.userGuess,
			item.results?.aggregated
		);

		// Use calculated value or fall back to stored value
		return calculatedCorrectness;
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Your Identification History</Text>

			{history.length > 0 ? (
				<FlatList
					data={history}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => (
						<TouchableOpacity
							style={styles.historyItem}
							onPress={() => handleItemPress(item)}
						>
							{item.imageUrl && (
								<Image
									source={{ uri: item.imageUrl }}
									style={styles.thumbnail}
									resizeMode="cover"
								/>
							)}
							<View style={styles.itemInfo}>
								<Text style={styles.carName}>
									{item.results.aggregated.make} {item.results.aggregated.model}
								</Text>
								<Text style={styles.date}>{formatDate(item.timestamp)}</Text>
								{item.userGuess &&
									(item.userGuess.make || item.userGuess.model) && (
										<Text style={styles.guess}>
											Your guess: {item.userGuess.make} {item.userGuess.model}
										</Text>
									)}
							</View>
							<View
								style={[
									styles.resultBadge,
									isGuessCorrect(item)
										? styles.correctBadge
										: styles.incorrectBadge,
								]}
							>
								<Text style={styles.resultText}>
									{isGuessCorrect(item) ? 'Correct' : 'Incorrect'}
								</Text>
							</View>
						</TouchableOpacity>
					)}
					contentContainerStyle={styles.list}
				/>
			) : (
				<View style={styles.emptyState}>
					<Text style={styles.emptyText}>
						{session?.uid
							? 'No identifications yet. Take some photos to get started!'
							: 'Please sign in to see your identification history'}
					</Text>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: '#000', // Dark background
	},
	title: {
		fontSize: 22,
		fontWeight: 'bold',
		marginBottom: 20,
		color: '#fff',
	},
	list: {
		paddingBottom: 20,
	},
	historyItem: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 15,
		backgroundColor: '#121212', // Dark card background
		borderRadius: 8,
		marginBottom: 10,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.3,
		shadowRadius: 3,
		elevation: 2,
	},
	thumbnail: {
		width: 60,
		height: 60,
		borderRadius: 4,
		marginRight: 12,
	},
	itemInfo: {
		flex: 1,
	},
	carName: {
		fontSize: 16,
		fontWeight: '500',
		marginBottom: 4,
		color: '#fff',
	},
	date: {
		fontSize: 14,
		color: '#aaa',
		marginBottom: 4,
	},
	guess: {
		fontSize: 12,
		color: '#bbb',
		fontStyle: 'italic',
	},
	resultBadge: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 20,
	},
	correctBadge: {
		backgroundColor: '#1b5e20',
	},
	incorrectBadge: {
		backgroundColor: '#b71c1c',
	},
	resultText: {
		fontSize: 12,
		fontWeight: '500',
		color: '#fff',
	},
	emptyState: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 40,
	},
	emptyText: {
		textAlign: 'center',
		fontSize: 16,
		color: '#999',
	},
});

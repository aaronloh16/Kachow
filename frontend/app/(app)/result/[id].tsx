import React, { useState, useEffect, useCallback } from 'react';
import {
	View,
	Text,
	Image,
	StyleSheet,
	ScrollView,
	Pressable,
	ActivityIndicator,
	SafeAreaView,
	Platform,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { getIdentificationById } from '@/lib/identification/IdentificationService';
import { MaterialIcons } from '@expo/vector-icons';
import { useSession } from '../../../ctx';
import { MyDarkTheme } from '@/assets/theme';

type ResultData = {
	make: string;
	model: string;
	year: string;
	confidence: string;
	details: string;
	insights: string;
	error?: string;
};

type ExpertResults = {
	openai: ResultData | { first_round: ResultData; second_round: ResultData };
	gemini: ResultData | { first_round: ResultData; second_round: ResultData };
	custom_model: ResultData;
	aggregated: ResultData;
	process: 'single_round' | 'blackboard_two_rounds';
};

type UserGuess = {
	make: string;
	model: string;
};

// Helper function to render a single expert result
function renderExpertResult(expertData: ResultData | null) {
	if (!expertData) return <Text>No data available</Text>;

	const confidenceColor =
		{
			high: '#4caf50',
			medium: '#ff9800',
			low: '#f44336',
			none: '#9e9e9e',
		}[expertData.confidence?.toLowerCase() || 'none'] || '#9e9e9e';

	if (expertData.make === 'Error' || expertData.error) {
		return (
			<View style={styles.expertResultContainer}>
				<Text style={styles.errorText}>
					Error: {expertData.error || 'Could not analyze image'}
				</Text>
			</View>
		);
	}

	return (
		<View style={styles.expertResultContainer}>
			<View style={styles.expertResultRow}>
				<Text style={styles.expertResultLabel}>Make:</Text>
				<Text style={styles.expertResultValue}>{expertData.make}</Text>
			</View>
			<View style={styles.expertResultRow}>
				<Text style={styles.expertResultLabel}>Model:</Text>
				<Text style={styles.expertResultValue}>{expertData.model}</Text>
			</View>
			<View style={styles.expertResultRow}>
				<Text style={styles.expertResultLabel}>Year:</Text>
				<Text style={styles.expertResultValue}>{expertData.year}</Text>
			</View>
			<View style={styles.expertResultRow}>
				<Text style={styles.expertResultLabel}>Confidence:</Text>
				<View
					style={[
						styles.expertConfidenceBadge,
						{ backgroundColor: confidenceColor },
					]}
				>
					<Text style={styles.expertConfidenceText}>
						{expertData.confidence}
					</Text>
				</View>
			</View>
			<View style={styles.expertDetailsContainer}>
				<Text style={styles.expertDetailsLabel}>
					Details and interesting facts:
				</Text>
				<Text style={styles.expertDetailsText}>{expertData.details}</Text>
			</View>
		</View>
	);
}

export default function ResultScreen() {
	const params = useLocalSearchParams();
	const { session } = useSession();
	const identificationId = params.id as string;

	const [results, setResults] = useState<ExpertResults | null>(null);
	const [userGuess, setUserGuess] = useState<UserGuess | null>(null);
	const [imageUri, setImageUri] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('aggregated');
	const [expandedSections, setExpandedSections] = useState<string[]>(['main']);

	// Fetch from Firestore instead of parsing params
	useEffect(() => {
		async function fetchData() {
			if (!identificationId || !session?.uid) return;
			setLoading(true);
			try {
				const record = await getIdentificationById(
					session.uid,
					identificationId
				);
				if (record) {
					setImageUri(record.imageUrl);
					setUserGuess(record.userGuess);
					setResults(record.results as ExpertResults);
				}
			} catch (error) {
				console.error('Failed to load Firestore result:', error);
			} finally {
				setLoading(false);
			}
		}
		fetchData();
	}, [identificationId, session?.uid]);

	// Get confidence color
	const getConfidenceColor = useCallback((confidence: string) => {
		switch (confidence?.toLowerCase()) {
			case 'high':
				return '#4caf50';
			case 'medium':
				return '#ff9800';
			case 'low':
				return '#f44336';
			default:
				return '#9e9e9e';
		}
	}, []);

	// Helper function to get the display data for expert results
	const getExpertData = useCallback(
		(
			expert:
				| ResultData
				| { first_round: ResultData; second_round: ResultData },
			preferSecondRound: boolean = true
		) => {
			if (!expert) return null;

			if ('first_round' in expert && 'second_round' in expert) {
				return preferSecondRound ? expert.second_round : expert.first_round;
			}

			return expert;
		},
		[]
	);

	const toggleSection = useCallback((section: string) => {
		setExpandedSections((prev) =>
			prev.includes(section)
				? prev.filter((s) => s !== section)
				: [...prev, section]
		);
	}, []);

	// Return to home screen
	const handleBack = useCallback(() => {
		router.replace('/');
	}, []);

	// Check if user guess was correct
	const isGuessCorrect = useCallback(() => {
		if (!results || !userGuess || !userGuess.make || !userGuess.model)
			return false;

		const makeCorrect =
			userGuess.make.toLowerCase() === results.aggregated.make.toLowerCase();
		const modelCorrect =
			userGuess.model.toLowerCase() === results.aggregated.model.toLowerCase();

		return makeCorrect && modelCorrect;
	}, [results, userGuess]);

	if (loading || !results) {
		return (
			<SafeAreaView style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#0000ff" />
				<Text style={styles.loadingText}>Loading results...</Text>
			</SafeAreaView>
		);
	}

	// Get the main result from aggregated
	const mainResult = results.aggregated;
	const isBlackboard = results.process === 'blackboard_two_rounds';
	const hasGuess = userGuess && (userGuess.make || userGuess.model);
	const guessCorrect = hasGuess && isGuessCorrect();

	return (
		<SafeAreaView style={styles.container}>
			<Stack.Screen
				options={{
					title: 'Results',
					headerShown: true,
					headerBackButtonDisplayMode: 'minimal',
					headerStyle: { backgroundColor: MyDarkTheme.colors.card },
					headerTintColor: MyDarkTheme.colors.text, // or use white if you want
				}}
			/>
			<ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
				{/* Image Section */}
				<View style={styles.imageContainer}>
					{imageUri && (
						<Image
							source={{ uri: imageUri }}
							style={styles.image}
							resizeMode="cover"
						/>
					)}
					<View style={styles.imageOverlay} />
					<View style={styles.imageTextContainer}>
						<Text style={styles.makeModel}>
							{mainResult.make !== 'Error'
								? `${mainResult.make} ${mainResult.model}`
								: 'Unable to identify'}
						</Text>
						<Text style={styles.year}>
							{mainResult.year !== 'Unknown' ? mainResult.year : ''}
						</Text>
					</View>
				</View>

				{/* User Guess Section (if available) */}
				{hasGuess && (
					<View style={styles.guessContainer}>
						<Text style={styles.guessTitle}>Your Guess:</Text>
						<View style={styles.guessContent}>
							<Text style={styles.guessText}>
								{userGuess.make} {userGuess.model}
							</Text>
							<View
								style={[
									styles.guessResultBadge,
									guessCorrect ? styles.correctBadge : styles.incorrectBadge,
								]}
							>
								<Text style={styles.guessResultText}>
									{guessCorrect ? 'Correct!' : 'Incorrect'}
								</Text>
							</View>
						</View>
					</View>
				)}

				{/* Main Identification Result */}
				<View style={styles.mainResultContainer}>
					<Pressable
						style={styles.sectionHeader}
						onPress={() => toggleSection('main')}
					>
						<Text style={styles.sectionTitle}>Identification Result</Text>
						<MaterialIcons
							name={
								expandedSections.includes('main')
									? 'keyboard-arrow-up'
									: 'keyboard-arrow-down'
							}
							size={24}
							color="#333"
						/>
					</Pressable>

					{expandedSections.includes('main') && (
						<View style={styles.mainResultContent}>
							<View style={styles.resultRow}>
								<Text style={styles.resultLabel}>Make:</Text>
								<Text style={styles.resultValue}>{mainResult.make}</Text>
							</View>
							<View style={styles.resultRow}>
								<Text style={styles.resultLabel}>Model:</Text>
								<Text style={styles.resultValue}>{mainResult.model}</Text>
							</View>
							<View style={styles.resultRow}>
								<Text style={styles.resultLabel}>Year:</Text>
								<Text style={styles.resultValue}>{mainResult.year}</Text>
							</View>
							<View style={styles.resultRow}>
								<Text style={styles.resultLabel}>Confidence:</Text>
								<View
									style={[
										styles.confidenceBadge,
										{
											backgroundColor: getConfidenceColor(
												mainResult.confidence
											),
										},
									]}
								>
									<Text style={styles.confidenceText}>
										{mainResult.confidence}
									</Text>
								</View>
							</View>
							<View style={styles.resultRow}>
								<Text style={styles.resultLabel}>Identification Process:</Text>
								<Text style={styles.resultValue}>
									{isBlackboard ? 'Two-round Blackboard' : 'Single round'}
								</Text>
							</View>
							<View style={styles.detailsContainer}>
								<Text style={styles.detailsLabel}>Insights:</Text>
								<Text style={styles.detailsText}>{mainResult.insights}</Text>
							</View>
						</View>
					)}
				</View>

				{/* Expert Analysis Section */}
				<View style={styles.expertsContainer}>
					<Pressable
						style={styles.sectionHeader}
						onPress={() => toggleSection('experts')}
					>
						<Text style={styles.sectionTitle}>Expert Analysis</Text>
						<MaterialIcons
							name={
								expandedSections.includes('experts')
									? 'keyboard-arrow-up'
									: 'keyboard-arrow-down'
							}
							size={24}
							color="#333"
						/>
					</Pressable>

					{expandedSections.includes('experts') && (
						<View style={styles.expertsContent}>
							{/* Expert Tabs */}
							<View style={styles.tabsContainer}>
								<Pressable
									style={[
										styles.tab,
										activeTab === 'aggregated' && styles.activeTab,
									]}
									onPress={() => setActiveTab('aggregated')}
								>
									<Text
										style={[
											styles.tabText,
											activeTab === 'aggregated' && styles.activeTabText,
										]}
									>
										Aggregate
									</Text>
								</Pressable>
								<Pressable
									style={[
										styles.tab,
										activeTab === 'openai' && styles.activeTab,
									]}
									onPress={() => setActiveTab('openai')}
								>
									<Text
										style={[
											styles.tabText,
											activeTab === 'openai' && styles.activeTabText,
										]}
									>
										OpenAI
									</Text>
								</Pressable>
								<Pressable
									style={[
										styles.tab,
										activeTab === 'gemini' && styles.activeTab,
									]}
									onPress={() => setActiveTab('gemini')}
								>
									<Text
										style={[
											styles.tabText,
											activeTab === 'gemini' && styles.activeTabText,
										]}
									>
										Gemini
									</Text>
								</Pressable>
								<Pressable
									style={[styles.tab, activeTab === 'ml' && styles.activeTab]}
									onPress={() => setActiveTab('ml')}
								>
									<Text
										style={[
											styles.tabText,
											activeTab === 'ml' && styles.activeTabText,
										]}
									>
										ML Model
									</Text>
								</Pressable>
							</View>

							{/* Expert Content */}
							<View style={styles.tabContent}>
								{activeTab === 'aggregated' && (
									<View>
										<Text style={styles.expertTitle}>Aggregated Analysis</Text>
										<Text style={styles.expertDescription}>
											Combined analysis from all experts, weighted based on
											confidence and expertise.
										</Text>
										<View style={styles.expertDetails}>
											<Text style={styles.expertDetailsTitle}>
												Details and interesting facts:
											</Text>
											<Text style={styles.detailsText}>
												{mainResult.details}
											</Text>
										</View>
									</View>
								)}

								{activeTab === 'openai' && (
									<View>
										<Text style={styles.expertTitle}>OpenAI Analysis</Text>
										{isBlackboard && (
											<View style={styles.roundsContainer}>
												<Pressable
													style={[
														styles.roundTab,
														expandedSections.includes('openai-r1') &&
															styles.activeRoundTab,
													]}
													onPress={() => toggleSection('openai-r1')}
												>
													<Text style={styles.roundText}>First Round</Text>
													<MaterialIcons
														name={
															expandedSections.includes('openai-r1')
																? 'keyboard-arrow-up'
																: 'keyboard-arrow-down'
														}
														size={18}
														color="#333"
													/>
												</Pressable>

												{expandedSections.includes('openai-r1') && (
													<View style={styles.roundContent}>
														{renderExpertResult(
															getExpertData(results.openai, false)
														)}
													</View>
												)}

												<Pressable
													style={[
														styles.roundTab,
														expandedSections.includes('openai-r2') &&
															styles.activeRoundTab,
													]}
													onPress={() => toggleSection('openai-r2')}
												>
													<Text style={styles.roundText}>
														Second Round (with context)
													</Text>
													<MaterialIcons
														name={
															expandedSections.includes('openai-r2')
																? 'keyboard-arrow-up'
																: 'keyboard-arrow-down'
														}
														size={18}
														color="#333"
													/>
												</Pressable>

												{expandedSections.includes('openai-r2') && (
													<View style={styles.roundContent}>
														{renderExpertResult(
															getExpertData(results.openai, true)
														)}
													</View>
												)}
											</View>
										)}

										{!isBlackboard &&
											renderExpertResult(getExpertData(results.openai))}
									</View>
								)}

								{activeTab === 'gemini' && (
									<View>
										<Text style={styles.expertTitle}>Gemini Analysis</Text>
										{isBlackboard && (
											<View style={styles.roundsContainer}>
												<Pressable
													style={[
														styles.roundTab,
														expandedSections.includes('gemini-r1') &&
															styles.activeRoundTab,
													]}
													onPress={() => toggleSection('gemini-r1')}
												>
													<Text style={styles.roundText}>First Round</Text>
													<MaterialIcons
														name={
															expandedSections.includes('gemini-r1')
																? 'keyboard-arrow-up'
																: 'keyboard-arrow-down'
														}
														size={18}
														color="#333"
													/>
												</Pressable>

												{expandedSections.includes('gemini-r1') && (
													<View style={styles.roundContent}>
														{renderExpertResult(
															getExpertData(results.gemini, false)
														)}
													</View>
												)}

												<Pressable
													style={[
														styles.roundTab,
														expandedSections.includes('gemini-r2') &&
															styles.activeRoundTab,
													]}
													onPress={() => toggleSection('gemini-r2')}
												>
													<Text style={styles.roundText}>
														Second Round (with context)
													</Text>
													<MaterialIcons
														name={
															expandedSections.includes('gemini-r2')
																? 'keyboard-arrow-up'
																: 'keyboard-arrow-down'
														}
														size={18}
														color="#333"
													/>
												</Pressable>

												{expandedSections.includes('gemini-r2') && (
													<View style={styles.roundContent}>
														{renderExpertResult(
															getExpertData(results.gemini, true)
														)}
													</View>
												)}
											</View>
										)}

										{!isBlackboard &&
											renderExpertResult(getExpertData(results.gemini))}
									</View>
								)}

								{activeTab === 'ml' && (
									<View>
										<Text style={styles.expertTitle}>
											Machine Learning Model
										</Text>
										<Text style={styles.expertDescription}>
											Custom image recognition model specialized in car logo
											identification.
										</Text>
										{renderExpertResult(results.custom_model)}
									</View>
								)}
							</View>
						</View>
					)}
				</View>

				{/* Back to Home Button */}
				<Pressable style={styles.backButton} onPress={handleBack}>
					<Text style={styles.backButtonText}>Identify Another Car</Text>
				</Pressable>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#000', // dark background
		paddingTop: Platform.OS === 'android' ? 25 : 0,
	},
	scrollView: {
		flex: 1,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingText: {
		marginTop: 10,
		fontSize: 16,
		color: '#fff',
	},
	imageContainer: {
		height: 250,
		width: '100%',
		position: 'relative',
	},
	image: {
		width: '100%',
		height: '100%',
	},
	imageOverlay: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		height: 100,
		backgroundColor: 'rgba(0,0,0,0.5)',
	},
	imageTextContainer: {
		position: 'absolute',
		bottom: 20,
		left: 20,
		right: 20,
	},
	makeModel: {
		color: '#fff',
		fontSize: 26,
		fontWeight: 'bold',
		textShadowColor: 'rgba(0, 0, 0, 0.75)',
		textShadowOffset: { width: -1, height: 1 },
		textShadowRadius: 10,
	},
	year: {
		color: '#ccc',
		fontSize: 18,
		marginTop: 4,
		textShadowColor: 'rgba(0, 0, 0, 0.75)',
		textShadowOffset: { width: -1, height: 1 },
		textShadowRadius: 10,
	},
	mainResultContainer: {
		margin: 16,
		backgroundColor: '#121212',
		borderRadius: 10,
		overflow: 'hidden',
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 16,
		backgroundColor: '#1a1a1a',
		borderBottomWidth: 1,
		borderBottomColor: '#333',
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#fff',
	},
	mainResultContent: {
		padding: 16,
	},
	resultRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
	},
	resultLabel: {
		width: 120,
		fontSize: 16,
		fontWeight: '600',
		color: '#bbb',
	},
	resultValue: {
		flex: 1,
		fontSize: 16,
		color: '#fff',
	},
	confidenceBadge: {
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 16,
	},
	confidenceText: {
		color: '#fff',
		fontWeight: 'bold',
		textTransform: 'uppercase',
	},
	detailsContainer: {
		marginTop: 8,
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: '#333',
	},
	detailsLabel: {
		fontSize: 16,
		fontWeight: '600',
		color: '#bbb',
		marginBottom: 8,
	},
	detailsText: {
		fontSize: 14,
		lineHeight: 22,
		color: '#ddd',
	},
	expertsContainer: {
		margin: 16,
		marginTop: 0,
		backgroundColor: '#121212',
		borderRadius: 10,
		overflow: 'hidden',
	},
	expertsContent: {
		padding: 16,
	},
	tabsContainer: {
		flexDirection: 'row',
		borderBottomWidth: 1,
		borderBottomColor: '#333',
		marginBottom: 16,
	},
	tab: {
		flex: 1,
		paddingVertical: 12,
		alignItems: 'center',
	},
	activeTab: {
		borderBottomWidth: 2,
		borderBottomColor: '#3498db',
	},
	tabText: {
		fontSize: 14,
		color: '#aaa',
	},
	activeTabText: {
		color: '#3498db',
		fontWeight: 'bold',
	},
	tabContent: {
		minHeight: 200,
	},
	expertTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 8,
		color: '#fff',
	},
	expertDescription: {
		fontSize: 14,
		color: '#aaa',
		marginBottom: 16,
		fontStyle: 'italic',
	},
	expertDetails: {
		backgroundColor: '#1c1c1c',
		padding: 12,
		borderRadius: 8,
	},
	roundsContainer: {
		marginVertical: 12,
	},
	roundTab: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: '#222',
		padding: 12,
		borderRadius: 8,
		marginBottom: 8,
	},
	activeRoundTab: {
		backgroundColor: '#2d2d2d',
	},
	roundText: {
		fontSize: 14,
		fontWeight: '600',
		color: '#fff',
	},
	roundContent: {
		marginBottom: 16,
		padding: 12,
		backgroundColor: '#1a1a1a',
		borderRadius: 8,
	},
	expertResultContainer: {
		marginBottom: 8,
	},
	expertResultRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	expertResultLabel: {
		width: 100,
		fontSize: 14,
		fontWeight: '600',
		color: '#aaa',
	},
	expertResultValue: {
		flex: 1,
		fontSize: 14,
		color: '#fff',
	},
	expertConfidenceBadge: {
		paddingHorizontal: 10,
		paddingVertical: 3,
		borderRadius: 12,
	},
	expertConfidenceText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 12,
		textTransform: 'uppercase',
	},
	expertDetailsContainer: {
		marginTop: 8,
	},
	expertDetailsLabel: {
		fontSize: 14,
		fontWeight: '600',
		color: '#bbb',
		marginBottom: 4,
	},
	expertDetailsText: {
		fontSize: 14,
		lineHeight: 20,
		color: '#ddd',
	},
	errorText: {
		color: '#f44336',
		fontStyle: 'italic',
	},
	backButton: {
		margin: 16,
		backgroundColor: '#3498db',
		padding: 16,
		borderRadius: 8,
		alignItems: 'center',
	},
	backButtonText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 16,
	},
	guessContainer: {
		margin: 16,
		padding: 16,
		backgroundColor: '#121212',
		borderRadius: 10,
		overflow: 'hidden',
	},
	guessTitle: {
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 8,
		color: '#bbb',
	},
	guessContent: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	guessText: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#fff',
	},
	guessResultBadge: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 20,
	},
	correctBadge: {
		backgroundColor: '#005f3f',
	},
	incorrectBadge: {
		backgroundColor: '#5f0000',
	},
	guessResultText: {
		fontSize: 12,
		fontWeight: '500',
		color: '#fff',
	},
	expertDetailsTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 8,
		color: '#fff',
	},
});

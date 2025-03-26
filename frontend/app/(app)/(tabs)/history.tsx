import { Text, View, StyleSheet, FlatList } from 'react-native';

// Placeholder data for car identifications
const MOCK_HISTORY = [
	{ id: '1', date: '2023-03-25', car: 'Toyota Camry', correct: true },
	{ id: '2', date: '2023-03-24', car: 'Honda Civic', correct: false },
	{ id: '3', date: '2023-03-22', car: 'Ford Mustang', correct: true },
];

export default function HistoryScreen() {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Your Identification History</Text>

			{MOCK_HISTORY.length > 0 ? (
				<FlatList
					data={MOCK_HISTORY}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => (
						<View style={styles.historyItem}>
							<View>
								<Text style={styles.carName}>{item.car}</Text>
								<Text style={styles.date}>{item.date}</Text>
							</View>
							<View
								style={[
									styles.resultBadge,
									item.correct ? styles.correctBadge : styles.incorrectBadge,
								]}
							>
								<Text style={styles.resultText}>
									{item.correct ? 'Correct' : 'Incorrect'}
								</Text>
							</View>
						</View>
					)}
					contentContainerStyle={styles.list}
				/>
			) : (
				<View style={styles.emptyState}>
					<Text style={styles.emptyText}>
						No identifications yet. Take some photos to get started!
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
	},
	title: {
		fontSize: 22,
		fontWeight: 'bold',
		marginBottom: 20,
	},
	list: {
		paddingBottom: 20,
	},
	historyItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 15,
		backgroundColor: 'white',
		borderRadius: 8,
		marginBottom: 10,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 1,
		elevation: 1,
	},
	carName: {
		fontSize: 16,
		fontWeight: '500',
		marginBottom: 4,
	},
	date: {
		fontSize: 14,
		color: '#666',
	},
	resultBadge: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 20,
	},
	correctBadge: {
		backgroundColor: '#e6f7ed',
	},
	incorrectBadge: {
		backgroundColor: '#fdeded',
	},
	resultText: {
		fontSize: 12,
		fontWeight: '500',
		color: '#333',
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
		color: '#666',
	},
});

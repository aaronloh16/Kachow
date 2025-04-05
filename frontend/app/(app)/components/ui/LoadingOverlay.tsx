import { ActivityIndicator, Modal, View, Text, StyleSheet } from 'react-native';

type LoadingOverlayProps = {
	visible: boolean;
	message?: string;
};

export function LoadingOverlay({
	visible,
	message = 'Processing image...',
}: LoadingOverlayProps) {
	return (
		<Modal transparent visible={visible} animationType="fade">
			<View style={styles.overlay}>
				<View style={styles.container}>
					<ActivityIndicator size="large" color="#f44336" />
					<Text style={styles.text}>{message}</Text>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	container: {
		backgroundColor: 'white',
		padding: 24,
		borderRadius: 8,
		alignItems: 'center',
		elevation: 5,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		minWidth: 200,
	},
	text: {
		marginTop: 16,
		fontSize: 16,
		fontWeight: '500',
		textAlign: 'center',
	},
});

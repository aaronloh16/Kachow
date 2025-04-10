// app/loading.tsx
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import LottieView from 'lottie-react-native';

import { useEffect, useRef, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import animationData from '../assets/car-revving.json';

export default function LoadingScreen() {
	const animation = useRef(null);

	const [isCancelled, setIsCancelled] = useState(false);

	

	const handleCancel = () => {
		setIsCancelled(true);
		router.replace('/');
	};

	return (
		<View style={styles.container}>
			<LottieView
            source={require('../assets/car-revving.json')}
            autoPlay
            loop
            style={{ width: 300, height: 300 }}
            />
            <Text style={styles.text}>Identifying car...</Text>

			<TouchableOpacity style={styles.cancelButton} >
				<Text style={styles.cancelText} onPress={handleCancel}>Cancel</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'black',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	animation: {
		width: 300,
		height: 300,
	},
	text: {
		color: 'white',
		fontSize: 18,
		marginTop: 10,
	},
	cancelButton: {
		marginTop: 30,
		paddingVertical: 12,
		paddingHorizontal: 24,
		backgroundColor: '#f44336',
		borderRadius: 8,
	},
	cancelText: {
		color: 'white',
		fontWeight: 'bold',
	},
});

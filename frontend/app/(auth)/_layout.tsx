import { Stack } from 'expo-router';
import { View, ImageBackground, StyleSheet, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';

const backgroundImage = require('../../assets/images/background.jpg');

export default function AuthLayout() {
	const [fontsLoaded] = useFonts({
		Orbitron: require('../../assets/fonts/Orbitron-VariableFont_wght.ttf'),
	});

	if (!fontsLoaded) {
		return (
			<View style={styles.loaderContainer}>
				<ActivityIndicator size="large" color="#f44336" />
			</View>
		);
	}

	return (
		<ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
			<Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: 'transparent' },
                    animation: 'none',
                }}
            />
		</ImageBackground>
	);
}

const styles = StyleSheet.create({
	background: {
		flex: 1,
		width: '100%',
		height: '100%',
	},
	loaderContainer: {
		flex: 1,
		backgroundColor: 'black',
		justifyContent: 'center',
		alignItems: 'center',
	},
});

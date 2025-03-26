import { useEffect, useCallback, useReducer } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void];

function useAsyncState<T>(
	initialValue: [boolean, T | null] = [true, null]
): UseStateHook<T> {
	return useReducer(
		(
			state: [boolean, T | null],
			action: T | null = null
		): [boolean, T | null] => [false, action],
		initialValue
	) as UseStateHook<T>;
}

export async function setStorageItemAsync(key: string, value: string | null) {
	if (Platform.OS === 'web') {
		try {
			if (value === null) {
				localStorage.removeItem(key);
			} else {
				localStorage.setItem(key, value);
			}
		} catch (e) {
			console.error('Local storage is unavailable:', e);
		}
	} else {
		if (value == null) {
			await SecureStore.deleteItemAsync(key);
		} else {
			await SecureStore.setItemAsync(key, value);
		}
	}
}

export function useStorageState(key: string): UseStateHook<string> {
	// Public
	const [state, setState] = useAsyncState<string>();

	// Get
	useEffect(() => {
		if (Platform.OS === 'web') {
			try {
				if (typeof localStorage !== 'undefined') {
					setState(localStorage.getItem(key));
				}
			} catch (e) {
				console.error('Local storage is unavailable:', e);
			}
		} else {
			SecureStore.getItemAsync(key).then((value) => {
				setState(value);
			});
		}
	}, [key]);

	// Set
	const setValue = useCallback(
		(value: string | null) => {
			setState(value);
			setStorageItemAsync(key, value);
		},
		[key]
	);

	return [state, setValue];
}

//this is a hook that is used to store the state of the app meaning the state of the app is stored in the local storage of the device. Examples of state are the user's session, the user's preferences, the user's data, etc.

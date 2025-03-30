import {
	createContext,
	useContext,
	useEffect,
	useState,
	type PropsWithChildren,
} from 'react';
import { auth } from './lib/firebase';
import {
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signOut as firebaseSignOut,
	onAuthStateChanged,
	updateProfile,
} from 'firebase/auth';

const AuthContext = createContext<{
	signIn: (email: string, password: string) => Promise<void>;
	signUp: (email: string, password: string, displayName: string) => Promise<void>;
	signOut: () => void;
	session: any;
	isLoading: boolean;
} | null>(null);

// Hook to use session anywhere in your app
export function useSession() {
	const value = useContext(AuthContext);
	if (!value) {
		throw new Error('useSession must be wrapped in a <SessionProvider />');
	}
	return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
	const [session, setSession] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setSession(user ?? null);
			setIsLoading(false);
		});
		return unsubscribe;
	}, []);

	const signIn = async (email: string, password: string) => {
		await signInWithEmailAndPassword(auth, email, password);
	};

	const signUp = async (email: string, password: string, fullName: string) => {
		const cred = await createUserWithEmailAndPassword(auth, email, password);
		await updateProfile(cred.user, { displayName: fullName });
	};

	const signOut = () => {
		firebaseSignOut(auth);
	};

	return (
		<AuthContext.Provider
			value={{
				signIn,
				signUp,
				signOut,
				session,
				isLoading,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

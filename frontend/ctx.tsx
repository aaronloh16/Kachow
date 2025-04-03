// ctx.tsx
import {
	createContext,
	useContext,
	useEffect,
	useState,
	type PropsWithChildren,
} from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { AccountManager } from './lib/auth/AccountManager';

const accountManager = new AccountManager();

const AuthContext = createContext<{
	signIn: (email: string, password: string) => Promise<void>;
	signUp: (email: string, password: string, displayName: string) => Promise<void>;
	signOut: () => void;
	session: any;
	isLoading: boolean;
} | null>(null);

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
		const user = await accountManager.authenticate(email, password);
		setSession(user);
	};

	const signUp = async (email: string, password: string, fullName: string) => {
		const user = await accountManager.createUser(email, password, fullName);
		setSession(user);
	};

	const signOut = async () => {
		await accountManager.signOut();
		setSession(null);
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

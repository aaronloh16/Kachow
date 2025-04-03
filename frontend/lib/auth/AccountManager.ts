import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	updateProfile,
	signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '../firebase';

export class AccountManager {
	async createUser(email: string, password: string, fullName: string) {
		const cred = await createUserWithEmailAndPassword(auth, email, password);
		await updateProfile(cred.user, { displayName: fullName });
		return cred.user;
	}

	async authenticate(email: string, password: string) {
		const cred = await signInWithEmailAndPassword(auth, email, password);
		return cred.user;
	}

	async signOut() {
		await firebaseSignOut(auth);
	}
}

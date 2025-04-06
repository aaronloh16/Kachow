import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	updateProfile,
	signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth } from '../firebase';
import { db } from '../firebase';

export class AccountManager {
	async createUser(email: string, password: string, fullName: string) {
		const cred = await createUserWithEmailAndPassword(auth, email, password);
		await updateProfile(cred.user, { displayName: fullName });

		await setDoc(doc(db, 'users', cred.user.uid), {
			fullName,
			email,
		});
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

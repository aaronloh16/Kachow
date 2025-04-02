import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadImageToFirebase(uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();

  const filename = `uploads/${Date.now()}.jpg`;
  const storageRef = ref(storage, filename);

  await uploadBytes(storageRef, blob);
  return await getDownloadURL(storageRef);
}

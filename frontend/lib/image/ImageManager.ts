import { uploadImageToFirebase } from './upload';

export class ImageManager {
	async processImage(uri: string): Promise<any> {
		
		const firebaseUrl = await uploadImageToFirebase(uri);

		
		const res = await fetch('http://172.17.95.68:5001/identify', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ image_url: firebaseUrl }),
		});

		if (!res.ok) throw new Error('Backend processing failed');
		return await res.json();
	}
}

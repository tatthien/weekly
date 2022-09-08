import app from './get-firebase-app';
import { getFirestore } from 'firebase/firestore';
export const db = getFirestore(app);
export default db;

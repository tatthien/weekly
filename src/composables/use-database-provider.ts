import { useLocalStorage } from './use-local-storage';
import { doc, getDocs, setDoc, collection, query, where } from 'firebase/firestore';
import db from '../utils/get-firebase-db';
import auth from '../utils/get-firebase-auth';

interface DatabaseInterface {
	read(id: string): any;
	insert(id: string, data: Record<string, any>): void;
}

type Plan = {
	content?: string;
	date?: string;
};

const plansDefaultValue: Array<Plan> = [];
const plans = useLocalStorage('GET_WEEKLY_PLANS', plansDefaultValue);

const DatabaseProviders: Record<'firebase' | 'localStorage', DatabaseInterface> = {
	firebase: {
		read: async (id: string) => {
			const currentUser = auth.currentUser;
			let data = null;
			const q = query(
				collection(db, `${import.meta.env.VITE_DB_NAME}/${currentUser?.uid}/plans`),
				where('date', '==', id)
			);
			const querySnap = await getDocs(q);
			querySnap.forEach((doc) => {
				data = doc.data();
			});

			return data;
		},
		insert: async (id: string, data: Record<string, any>) => {
			const currentUser = auth.currentUser;
			await setDoc(doc(db, `${import.meta.env.VITE_DB_NAME}/${currentUser?.uid}/plans/${id}`), data);
		},
	},
	localStorage: {
		read: (id: string) => {
			if (plans.value === undefined) {
				return null;
			}

			const data = plans.value.find((e: any) => e.date === id) ?? null;
			return data;
		},
		insert: (id: string, data: Record<string, any>) => {
			if (plans.value === undefined) {
				return;
			}

			const isExisted = !!plans.value.find((e: any) => e.date === id);
			if (isExisted) {
				plans.value = plans.value.map((e: any) => {
					return e.date === id ? data : e;
				});
			} else {
				plans.value.push(data);
			}
		},
	},
};

export function useDatabaseProvider(provider: 'firebase' | 'localStorage'): DatabaseInterface;

export function useDatabaseProvider(provider: 'firebase' | 'localStorage'): DatabaseInterface {
	const dbProvider = DatabaseProviders[provider];

	const read = (id: string) => {
		return dbProvider.read(id);
	};

	const insert = (id: string, data: Record<string, any>) => {
		return dbProvider.insert(id, data);
	};

	return {
		read,
		insert,
	};
}

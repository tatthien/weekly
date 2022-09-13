import { computed } from 'vue';
import { useLocalStorage } from './use-local-storage';

type AuthData = {
	accessToken: string;
	user: Record<string, any>;
};

export default function useUser() {
	const authData = useLocalStorage<AuthData | null>('GET_WEEKLY_AUTH'); // @TODO: make constant

	const displayName = computed(() => {
		if (!authData.value) {
			return '';
		}

		return authData.value.user.displayName;
	});

	const photoURL = computed(() => {
		if (!authData.value) {
			return '';
		}

		return authData.value.user.photoURL;
	});

	const uid = computed(() => {
		if (!authData.value) {
			return null;
		}

		return authData.value.user.uid;
	});

	const isLoggedIn = computed(() => {
		return !!authData.value?.accessToken;
	});

	function setAuthData(data: AuthData) {
		authData.value = data;
	}

	function clearAuthData() {
		authData.value = null;
	}

	return {
		displayName,
		photoURL,
		uid,
		setAuthData,
		clearAuthData,
		isLoggedIn,
	};
}

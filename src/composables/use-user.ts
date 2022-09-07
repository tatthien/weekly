import { computed, watch } from 'vue'
import { useLocalStorage } from "./use-local-storage";

export function useUser() {
	const authData = useLocalStorage('GET_WEEKLY_AUTH') // @TODO: make constant

	const displayName = computed(() => {
		if (!authData.value) {
			return ''
		}

		return authData.value.user.displayName
	})

	const photoURL = computed(() => {
		if (!authData.value) {
			return ''
		}

		return authData.value.user.photoURL
	})

	const isLoggedIn = computed(() => {
		return !!authData.value?.accessToken
	})

	function setAuthData(data: Record<string, any>) {
		authData.value = data
	}

	function logOut() {
		authData.value = null
	}

	return {
		displayName,
		photoURL,
		setAuthData,
		logOut,
		isLoggedIn,
	}
}

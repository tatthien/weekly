<script lang="ts" setup>
import { ref, watch } from 'vue';
import { format } from 'date-fns';
import { signInWithPopup, signOut, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import auth from '../utils/get-firebase-auth';
import { UserIcon } from '@heroicons/vue/24/outline';
import WButton from '@/components/WButton.vue';
import useUser from '../composables/use-user';
import { latestLog, addLog } from '../composables/use-logs';

const heading = format(new Date(), 'MMMM yyyy');
const showDropdown = ref(false);
const showLogs = ref(false);

const triggerLogs = () => {
	showLogs.value = true;
	setTimeout(() => (showLogs.value = false), 3000);
};

watch(latestLog, () => {
	triggerLogs();
});

const { setAuthData, clearAuthData, isLoggedIn, displayName, photoURL } = useUser();
const provider = new GoogleAuthProvider();

onAuthStateChanged(auth, (user) => {
	if (user) {
		addLog(`Hi ${user.displayName}!`);
	}
});

function logInWithGoogle() {
	signInWithPopup(auth, provider)
		.then((result) => {
			const credential = GoogleAuthProvider.credentialFromResult(result);
			setAuthData({
				accessToken: credential?.accessToken ?? '',
				user: result.user,
			});
		})
		.catch((error) => {
			throw Error(String(error));
		});
}

function logOut() {
	signOut(auth).then(() => {
		clearAuthData();
	});
}
</script>
<template>
	<header class="app-header">
		<div class="app-header__inner">
			<div class="left">
				<span class="font-bold">{{ heading }}</span>
			</div>
			<div class="right">
				<Transition name="slide">
					<span v-if="showLogs" class="app-logs">{{ latestLog }}</span>
				</Transition>

				<nav>
					<div v-if="isLoggedIn">
						<div class="dropdown">
							<WButton class="user-avatar" variant="ghost" icon @click="showDropdown = !showDropdown">
								<img :src="photoURL" :alt="displayName" />
							</WButton>
							<Transition name="slide">
								<div v-if="showDropdown" class="dropdown-menu" role="menu">
									<div class="dropdown-menu-item">
										<div>Log in as</div>
										<div>
											<strong>{{ displayName }}</strong>
										</div>
									</div>
									<div class="dropdown-menu-item" @click="logOut">
										<WButton link tabindex="-1" role="menuitem">Logout</WButton>
									</div>
								</div>
							</Transition>
						</div>
					</div>
					<template v-else>
						<WButton variant="ghost" icon title="Log in with Google" @click="logInWithGoogle">
							<UserIcon />
						</WButton>
					</template>
				</nav>
			</div>
		</div>
	</header>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
	transition: all 0.3s cubic-bezier(0.85, 0, 0.56, 0.69);
}

.slide-enter-from,
.slide-leave-to {
	transform: translateY(10px);
	opacity: 0;
}
</style>

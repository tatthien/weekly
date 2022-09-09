<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { format } from 'date-fns';
import { signInWithPopup, signOut, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import auth from '../utils/get-firebase-auth';
import { UserIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline';
import WButton from '@/components/WButton.vue';
import useUser from '../composables/use-user';
import { latestLog, addLog } from '../composables/use-logs';
import useCalendar from '../composables/use-calendar';

const { nextWeek, prevWeek, jumpToToday, firstDateOfWeek, isCurrentWeek } = useCalendar();
const heading = computed(() => format(firstDateOfWeek.value, 'MMMM yyyy'));
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
		addLog(`✋ Hi ${user.displayName}!`);
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
				<div class="flex items-center">
					<WButton variant="ghost" icon class="mr-2" @click="prevWeek">
						<ChevronLeftIcon />
					</WButton>
					<WButton variant="ghost" icon class="mr-2" @click="nextWeek">
						<ChevronRightIcon />
					</WButton>
					<WButton v-if="!isCurrentWeek" variant="ghost" class="mr-2" @click="jumpToToday">Today</WButton>
				</div>
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
							<Transition name="dropdown">
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

.dropdown-enter-active,
.dropdown-leave-active {
	transition: all 0.2s cubic-bezier(0.85, 0, 0.56, 0.69);
}

.dropdown-enter-from,
.dropdown-leave-to {
	transform: translateY(10px);
	opacity: 0;
}
</style>

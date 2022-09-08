import { ref, computed } from 'vue';

type StateDefinition = {
	logs: Array<string>;
};

const state = ref<StateDefinition>({
	logs: [],
});

export const logs = computed(() => {
	return state.value.logs;
});

export const latestLog = computed(() => {
	return state.value.logs[state.value.logs.length - 1];
});

export const addLog = (log: string) => {
	state.value.logs.push(log);
};

export const clearLogs = () => {
	state.value.logs = [];
};

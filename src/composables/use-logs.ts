import { ref, computed } from 'vue';

type LogsState = {
	logs: Array<string>;
};

export default function useLogs() {
	const state = ref<LogsState>({
		logs: [],
	});

	const logs = computed(() => {
		return state.value.logs;
	});

	const addLog = (log: string) => {
		state.value.logs.push(log);
	};

	return {
		logs,
		addLog,
	};
}

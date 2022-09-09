import { computed, ref } from 'vue';
import { addDays, subDays, startOfWeek, compareAsc } from 'date-fns';

const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
const firstDateOfWeek = ref(monday);
const isCurrentWeek = computed(() => {
	return compareAsc(firstDateOfWeek.value, monday) === 0;
});

export default function useCalendar() {
	const nextWeek = () => {
		firstDateOfWeek.value = addDays(firstDateOfWeek.value, 7);
	};

	const prevWeek = () => {
		firstDateOfWeek.value = subDays(firstDateOfWeek.value, 7);
	};

	const jumpToToday = () => {
		firstDateOfWeek.value = monday;
	};

	return {
		firstDateOfWeek,
		isCurrentWeek,
		nextWeek,
		prevWeek,
		jumpToToday,
	};
}

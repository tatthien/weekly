import { ref } from 'vue';
import { addDays, subDays, startOfWeek } from 'date-fns';

const firstDateOfWeek = ref(startOfWeek(new Date(), { weekStartsOn: 1 }));

export default function useCalendar() {
	const nextWeek = () => {
		firstDateOfWeek.value = addDays(firstDateOfWeek.value, 7);
	};

	const prevWeek = () => {
		firstDateOfWeek.value = subDays(firstDateOfWeek.value, 7);
	};

	return {
		firstDateOfWeek,
		nextWeek,
		prevWeek,
	};
}

<template>
	<AppHeader />
	<main class="app-main">
		<form class="grid">
			<Note
				v-for="(item, index) in list"
				:id="item.id"
				:key="item.id"
				:index="index"
				:title="item.title"
				:date-label="item.dateLabel"
				:week-day="item.weekDay"
				:week-date="item.weekDate"
			/>
		</form>
	</main>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import AppHeader from '@/components/AppHeader.vue';
import Note from '@/components/Note.vue';
import { format, addDays } from 'date-fns';
import useCalendar from './composables/use-calendar';
import { formatDateToId } from './utils/calendar';

const { firstDateOfWeek } = useCalendar();

const calendar = ref([
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
	'Sunday',
	'This Month',
	'Next Month',
]);

const list = computed(() => {
	return calendar.value.map((item, index) => {
		const weekDate = index <= 6 ? addDays(firstDateOfWeek.value, index) : null;
		let weekDay = item.toLowerCase().replace(/\s/gm, '_');
		let dateLabel = '';
		if (weekDate !== null) {
			dateLabel = format(weekDate, 'dd.MM');
		}
		return {
			id: weekDate !== null ? formatDateToId(weekDate) : weekDay,
			weekDay,
			weekDate,
			title: item,
			dateLabel,
		};
	});
});
</script>

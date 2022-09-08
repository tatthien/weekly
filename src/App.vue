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
import { format } from 'date-fns';

const today = ref(new Date());
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
const mondayOfCurrentWeek = computed(() => {
	const first = today.value.getDate() - today.value.getDay() + 1;
	const monday = new Date(today.value.setDate(first));
	return monday;
});
const list = computed(() => {
	return calendar.value.map((item, index) => {
		const weekDateTimestamp = new Date().setDate(mondayOfCurrentWeek.value.getDate() + index);
		const weekDate = index <= 6 ? new Date(weekDateTimestamp) : null;
		let weekDay = item.toLowerCase().replace(/\s/gm, '_');
		let dateLabel = '';
		if (weekDate !== null) {
			dateLabel = format(weekDate, 'dd.MM');
		}
		return {
			id: weekDate !== null ? `${weekDay}_${format(weekDate, 'dd_MM_yyyy')}` : weekDay,
			weekDay,
			weekDate,
			title: item,
			dateLabel,
		};
	});
});
</script>

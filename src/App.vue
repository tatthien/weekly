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
				:date="item.date"
			/>
		</form>
	</main>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import AppHeader from '@/components/AppHeader.vue';
import Note from '@/components/Note.vue';
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
		const date = index <= 6 ? new Date(new Date().setDate(mondayOfCurrentWeek.value.getDate() + index)) : null;
		let id = item.toLowerCase().replace(/\s/gm, '_');
		if (date !== null) {
			id = `${item.toLowerCase().replace(/\s/gm, '_')}_${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}`;
		}
		return {
			id,
			title: item,
			date,
		};
	});
});
</script>

<template>
	<label :for="id" :class="noteClasses">
		<span class="heading">
			<span>{{ title }}</span>
			<span :class="[!isToday ? 'secondary' : '']">{{ dateLabel }}</span>
		</span>
		<pre ref="highlightEl" class="editor highlight" v-html="highlightContent"></pre>
		<textarea :id="id" ref="editorEl" v-model="content" class="editor textarea"></textarea>
	</label>
</template>

<script lang="ts" setup>
import hljs from 'highlight.js';
import { setDoc, doc } from 'firebase/firestore';
import db from '../utils/get-db';
import { ref, computed, nextTick, onMounted } from 'vue';
import debounce from 'lodash/debounce'

const BRACKETS = new Map([
	['[', ']'],
	['(', ')'],
	['{', '}'],
]);

type PropsType = {
	id: string;
	index: number;
	title?: string;
	date?: Date;
};
const props = defineProps<PropsType>();
const editorEl = ref();
const highlightEl = ref();
const today = ref(new Date());
const isMonth = computed(() => {
	return props.id.indexOf('month') >= 0;
});
const isToday = computed(() => {
	return today.value.getDay() === props.index + 1;
});
const dateLabel = computed(() => {
	return props.date ? `${props.date.getDate()}.${today.value.getMonth() + 1}` : '';
});
const noteClasses = computed(() => {
	let classes = ['note', props.id.split('_')[0]];
	if (isMonth.value) classes.push('month');
	if (isToday.value) classes.push('today');
	return classes;
});
const content = ref('');
const highlightContent = computed(() => {
	let codeHighlight = hljs.highlight('markdown', content.value).value + '\n\n';

	codeHighlight = codeHighlight.replace(/^\[(x|@|~|\s)\] (.*)/gm, (match, p1, p2) => {
		let type = '';
		if (p1 === ' ') type = 'open';
		if (p1 === 'x') type = 'checked';
		if (p1 === '~') type = 'obsolete';
		if (p1 === '@') type = 'ongoing';
		// Prevent highligh.js from highlight tag and priority
		const dataSlug = match.replace(/@/g, '@-').replace(/!/g, '!-');
		return `<span class="task ${type}"><span class="checkbox" data-slug="${encodeURIComponent(dataSlug)}">[${p1}]</span><span> ${p2}</span></span>`;
	});

	// Strike through
	codeHighlight = codeHighlight.replace(/~~(.*?)~~/g, `<span class="strikethrough">~~$1~~</span>`);

	// Tag. Eg: @x-tag
	codeHighlight = codeHighlight.replace(/@([\w-_]+)/g, `<span class="badge tag">@$1</span>`);

	// Priorities. Eg: !High !Medium !Low
	codeHighlight = codeHighlight.replace(/!(high|medium|low)/gim, (match, value) => {
		return `<span class="badge priority ${value.toLowerCase()}">${match}</span>`;
	});

	// Event. Eg: ^ Christmas holiday
	codeHighlight = codeHighlight.replace(
		/^(\^) (.*)/gm,
		'<span class="event"><span class="hljs-bullet">$1</span> <span>$2</span></span>'
	);

	// Clickable link
	codeHighlight = codeHighlight.replace(/(\[.*\]\((.*)\))/g, (match, all, link) => {
		let m = link.match(/>(.*)</);
		if (m && m.length > 1) {
			return `<a target="_blank" rel="noopenner noreferrer" class="url" href="${m[1]}">${all}</a>`;
		} else {
			return match;
		}
	});

	nextTick(() => {
		document
			.querySelectorAll('.task')
			.forEach((el) => el.addEventListener('click', (event: Event) => changeTaskStatus(event)));
	});

	return codeHighlight;
});

const autoSaveContent = debounce(async () => {
	try {
		await setDoc(doc(db, `plans/${props.id}`), {
			content: content.value,
		});
		console.log('saved')
	} catch (error) {
		// handle error
	}
}, 500)

onMounted(() => {
	editorEl.value.addEventListener('scroll', () => scrollSync());
	editorEl.value.addEventListener('keydown', (event: KeyboardEvent) => syncInputContent(event));
	editorEl.value.addEventListener('input', (event: KeyboardEvent) => syncInputContent(event));

	document
		.querySelectorAll('.task')
		.forEach((el) => el.addEventListener('click', (event: Event) => changeTaskStatus(event)));
})

function changeTaskStatus(event: Event) {
	const targetEl = event.target as HTMLElement
	if (targetEl === null) return
	const status = targetEl.textContent;
	const data = decodeURIComponent(targetEl.getAttribute('data-slug') || '')
		.replace(/@-/g, '@')
		.replace(/!-/g, '!');
	const newContent = status ? status.replace(/\[(x|\s|@|~)\]/, (match: any, status: any) => {
		let newStatus = '';
		if (status === ' ') newStatus = '[x]';
		if (status === 'x') newStatus = '[@]';
		if (status === '@') newStatus = '[~]';
		if (status === '~') newStatus = '[ ]';
		return data.replace(/\[.*\]/, newStatus);
	}) : '';

	content.value = content.value.replace(data, newContent);
}

function scrollSync() {
	highlightEl.value.scrollTop = editorEl.value.scrollTop;
}

async function syncInputContent(e: KeyboardEvent) {
	hitBracket(e.key, e);
	autoSaveContent();
}

function hitBracket(keyPressed: string, e: Event) {
	if (BRACKETS.has(keyPressed)) {
		const isSquareBracket = keyPressed === '[';
		let cursorPos = editorEl.value.selectionStart;
		let left = content.value.substring(0, cursorPos);
		let right = content.value.substring(cursorPos);
		let whitespace = isSquareBracket ? ' ' : '';
		content.value = left + keyPressed + whitespace + BRACKETS.get(keyPressed) + right + whitespace;

		nextTick(() => {
			editorEl.value.selectionEnd = cursorPos + (isSquareBracket ? 4 : 1);
			e.preventDefault();
		});
	}
}
</script>

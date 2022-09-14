<template>
	<label :for="id" :class="noteClasses">
		<span class="heading">
			<span>{{ props.dateLabel }}</span>
			<span :class="[!isToday ? 'secondary' : '']">{{ title }}</span>
		</span>
		<pre ref="highlightEl" class="editor highlight" v-html="highlightContent"></pre>
		<textarea :id="id" ref="editorEl" v-model="content" class="editor textarea"></textarea>
	</label>
</template>

<script lang="ts" setup>
import { format } from 'date-fns';
import hljs from 'highlight.js';
import { onAuthStateChanged } from 'firebase/auth';
import auth from '../utils/get-firebase-auth';
import { ref, computed, nextTick, onMounted } from 'vue';
import debounce from 'lodash/debounce';
import { addLog } from '../composables/use-logs';
import { formatDateToId } from '../utils/calendar';
import { useDatabaseProvider } from '../composables/use-database-provider';
import contentPlaceholder from '../utils/get-data-placeholder';

const firebaseProvider = useDatabaseProvider('firebase');
const localStorageProvider = useDatabaseProvider('localStorage');

const BRACKETS = new Map([
	['[', ']'],
	['(', ')'],
	['{', '}'],
]);

type PropsType = {
	id: string;
	index: number;
	title?: string;
	dateLabel?: string;
	weekDay: string;
	weekDate?: Date;
};
const props = defineProps<PropsType>();
const editorEl = ref();
const highlightEl = ref();
const today = ref(new Date());
const isMonth = computed(() => {
	return props.id.indexOf('month') >= 0;
});
const isToday = computed(() => {
	return formatDateToId(today.value) === props.id;
});
const noteClasses = computed(() => {
	let classes = ['note', props.id.split('_')[0]];
	if (isMonth.value) classes.push('month');
	if (isToday.value) classes.push('today');
	return classes;
});
const content = ref('');

const highlightContent = computed(() => {
	let codeHighlight = hljs.highlight(content.value, { language: 'markdown' }).value + '\n\n';

	codeHighlight = codeHighlight.replace(/^\[(x|@|~|\s)\] (.*)/gm, (match, p1, p2) => {
		let type = '';
		if (p1 === ' ') type = 'open';
		if (p1 === 'x') type = 'checked';
		if (p1 === '~') type = 'obsolete';
		if (p1 === '@') type = 'ongoing';
		// Prevent highligh.js from highlight tag and priority
		const dataSlug = match.replace(/@/g, '@-').replace(/!/g, '!-');
		return `<span class="task ${type}"><span class="checkbox" data-slug="${encodeURIComponent(
			dataSlug
		)}">[${p1}]</span><span> ${p2}</span></span>`;
	});

	// Strike through
	codeHighlight = codeHighlight.replace(/~~(.*?)~~/g, `<span class="strikethrough">~~$1~~</span>`);

	// Tag. Eg: @x-tag
	codeHighlight = codeHighlight.replace(/@([\w-_.]+)/g, `<span class="badge tag">@$1</span>`);

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

const autoSaveContent = debounce(() => {
	onAuthStateChanged(auth, async (user) => {
		const id = props.weekDate ? format(props.weekDate, 'dd_MM_yyyy') : props.weekDay;
		const data = {
			content: content.value,
			date: id,
		};

		if (user) {
			try {
				firebaseProvider.insert(id, data);
				addLog(`🎉 Saved at ${format(new Date(), 'dd-MM-yyyy H:ii:ss')}`);
			} catch (error) {
				throw Error(String(error));
			}
		} else {
			localStorageProvider.insert(id, data);
			addLog(`🎉 Saved at ${format(new Date(), 'dd-MM-yyyy H:ii:ss')}`);
		}
	});
}, 500);

onMounted(() => {
	editorEl.value.addEventListener('scroll', () => scrollSync());
	editorEl.value.addEventListener('keydown', (event: KeyboardEvent) => syncInputContent(event));
	editorEl.value.addEventListener('input', (event: KeyboardEvent) => syncInputContent(event));

	document
		.querySelectorAll('.task')
		.forEach((el) => el.addEventListener('click', (event: Event) => changeTaskStatus(event)));
});

// Read data from firebase or local storage
onAuthStateChanged(auth, async (user) => {
	const id = props.weekDate ? format(props.weekDate, 'dd_MM_yyyy') : props.weekDay;
	if (user) {
		const data = await firebaseProvider.read(id);
		content.value = data ? data.content : '';
	} else {
		const data = localStorageProvider.read(id);
		if (id === 'this_month' && data === null) {
			content.value = contentPlaceholder;
		} else {
			content.value = data ? data.content : '';
		}
	}
});

function changeTaskStatus(event: Event) {
	const targetEl = event.target as HTMLElement;
	if (targetEl === null) return;
	const status = targetEl.textContent;
	const data = decodeURIComponent(targetEl.getAttribute('data-slug') || '')
		.replace(/@-/g, '@')
		.replace(/!-/g, '!');
	const newContent = status
		? status.replace(/\[(x|\s|@|~)\]/, (match: any, status: any) => {
				let newStatus = '';
				if (status === ' ') newStatus = '[x]';
				if (status === 'x') newStatus = '[@]';
				if (status === '@') newStatus = '[~]';
				if (status === '~') newStatus = '[ ]';
				return data.replace(/\[.*\]/, newStatus);
		  })
		: '';

	content.value = content.value.replace(data, newContent);
	autoSaveContent();
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

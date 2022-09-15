const stopPropagation = (e: Event): void => {
	e.stopPropagation();
};

let triggerEvent: () => void;

export default {
	mounted(el: Element, binding: any) {
		if (typeof binding.value !== 'function') {
			throw Error(`[v-click-outside] ${binding.value} is not a function`);
		}

		triggerEvent = () => {
			binding.value();
		};

		el.addEventListener('click', stopPropagation);
		document.body.addEventListener('click', triggerEvent);
	},
	unmounted(el: Element) {
		el.removeEventListener('click', stopPropagation);
		document.body.removeEventListener('click', triggerEvent);
	},
};

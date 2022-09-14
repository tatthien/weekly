import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

export default {
	mounted(el: Element, binding: any) {
		tippy(el, { content: binding.value });
	},
};

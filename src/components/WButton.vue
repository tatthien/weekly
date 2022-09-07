<template>
	<component
		:is="component"
		:class="[commonClass, variantClass, props.icon ? 'btn-icon' : '', props.link ? 'btn-link' : '']"
		:type="props.type"
		:disabled="props.disabled"
		v-bind="additionalProps"
		@click="onClick"
	>
		<slot name="prepend-outer"></slot>
		<span>
			<slot></slot>
		</span>
		<slot name="append-outer"></slot>
	</component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type PropType = {
	disabled?: boolean
	href?: string
	type?: string
	icon?: boolean
	link?: boolean
	variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'ghost'
}

const props = withDefaults(defineProps<PropType>(), {
	disabled: false,
	href: '',
	type: 'button',
	icon: false,
	link: false,
	variant: 'primary'
})

const emit = defineEmits(['click'])

const component = computed(() => {
	if (props.disabled) return 'button'
	if (props.href !== '') return 'a'
	return 'button'
})

const additionalProps = computed(() => {
	if (component.value === 'a') {
		return {
			href: props.href,
			rel: 'noopener noreferrer',
		}
	}

	return {}
})

const commonClass = 'btn'
const variantClass = computed(() => {
	return `btn-${props.variant}`
})

const onClick = (event: MouseEvent) => {
	emit('click', event)
}
</script>

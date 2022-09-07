import { ref, watch } from 'vue';

interface Serializer<T> {
	read(raw: string): T;
	write(value: T): string;
}

const StorageSerializers: Record<'boolean' | 'string' | 'number' | 'object' | 'any', Serializer<any>> = {
	boolean: {
		read: (v: any) => v === 'true',
		write: (v: any) => String(v),
	},
	string: {
		read: (v: any) => v,
		write: (v: any) => String(v),
	},
	number: {
		read: (v: any) => Number.parseFloat(v),
		write: (v: any) => String(v),
	},
	object: {
		read: (v: any) => JSON.parse(v),
		write: (v: any) => JSON.stringify(v),
	},
	any: {
		read: (v: any) => JSON.parse(v),
		write: (v: any) => JSON.stringify(v),
	},
};

function getSerializerType<T>(rawData: T) {
	if (rawData === null) return 'any';
	if (typeof rawData === 'string') return 'string';
	if (typeof rawData === 'number') return 'number';
	if (typeof rawData === 'object') return 'object';
	if (typeof rawData === 'boolean') return 'boolean';
	if (Array.isArray(rawData)) return 'object';
	return 'object';
}

export function useLocalStorage<T extends string | number | boolean | object | null>(key: string) {
	const data = ref<T>();
	const type = getSerializerType(data.value);
	const serializer = StorageSerializers[type];

	watch(
		data,
		() => {
			if (data.value === null) {
				window.localStorage.removeItem(key);
			} else {
				write(key);
			}
		},
		{ deep: true }
	);

	data.value = read(key);

	return data;

	function read(key: string) {
		const rawData = window.localStorage.getItem(key);
		return serializer.read(rawData || '');
	}

	function write(key: string) {
		window.localStorage.setItem(key, serializer.write(data.value));
	}
}

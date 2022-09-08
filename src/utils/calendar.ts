import { format } from 'date-fns';

export function formatDateToId(date: Date) {
	return format(date, 'EEEE_dd_MM_yyyy').toLocaleLowerCase();
}

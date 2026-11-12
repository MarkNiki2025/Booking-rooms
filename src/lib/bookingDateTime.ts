export interface BookingDateTimeFields {
  date: string;
  startTime: string;
  endTime: string;
}

export function bookingIntervalsOverlap(
  existingStart: number,
  existingEnd: number,
  newStart: number,
  newEnd: number
): boolean {
  return existingStart < newEnd && existingEnd > newStart;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatLocalDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatLocalTime(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function parseLocalDateTime(
  dateValue: string,
  timeValue: string
): Date | null {
  const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
  const timeParts = /^(\d{2}):(\d{2})$/.exec(timeValue);
  if (!dateParts || !timeParts) return null;

  const [, yearValue, monthValue, dayValue] = dateParts;
  const [, hourValue, minuteValue] = timeParts;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const hour = Number(hourValue);
  const minute = Number(minuteValue);
  const parsed = new Date(year, month - 1, day, hour, minute);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day ||
    parsed.getHours() !== hour ||
    parsed.getMinutes() !== minute
  ) {
    return null;
  }

  return parsed;
}

export function getDefaultBookingDateTime(): BookingDateTimeFields {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  if (start.getTime() <= Date.now()) start.setHours(start.getHours() + 1);
  const end = new Date(start);
  end.setHours(end.getHours() + 1);

  return {
    date: formatLocalDate(start),
    startTime: formatLocalTime(start),
    endTime: formatLocalTime(end),
  };
}

import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";

export const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export function toDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

// Weekdays in Monday-first order, as getDay() numbers, for weekday pickers.
export const MONDAY_FIRST_WEEKDAYS = [1, 2, 3, 4, 5, 6, 0];

export function formatWeekdays(weekdays: number[]): string {
  return MONDAY_FIRST_WEEKDAYS.filter((d) => weekdays.includes(d))
    .map((d) => WEEKDAY_LABELS[d])
    .join("·");
}

export function getTodayKey(): string {
  return toDateKey(new Date());
}

export function getTomorrowKey(): string {
  return toDateKey(addDays(new Date(), 1));
}

export function getMonthGrid(monthAnchor: Date): Date[] {
  const start = startOfWeek(startOfMonth(monthAnchor));
  const end = endOfWeek(endOfMonth(monthAnchor));
  return eachDayOfInterval({ start, end });
}

export function isCurrentMonth(date: Date, monthAnchor: Date): boolean {
  return isSameMonth(date, monthAnchor);
}

export function isDateToday(date: Date): boolean {
  return isToday(date);
}

export function nextMonth(monthAnchor: Date): Date {
  return addMonths(monthAnchor, 1);
}

export function previousMonth(monthAnchor: Date): Date {
  return subMonths(monthAnchor, 1);
}

export function formatMonthTitle(monthAnchor: Date): string {
  return format(monthAnchor, "yyyy년 M월");
}

export function formatDayTitle(date: Date): string {
  const weekday = WEEKDAY_LABELS[date.getDay()];
  return `${format(date, "M월 d일")} (${weekday})`;
}

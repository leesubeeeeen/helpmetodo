import {
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

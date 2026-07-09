const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export function isCalendarDate(value: string) {
  if (!datePattern.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return formatCalendarDate(date) === value;
}

export function compareCalendarDates(left: string, right: string) {
  return left.localeCompare(right);
}

export function isDateInRange(date: string, startDate: string, endDate: string) {
  return (
    compareCalendarDates(startDate, date) <= 0 &&
    compareCalendarDates(date, endDate) <= 0
  );
}

export function addCalendarDays(value: string, days: number) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return formatCalendarDate(date);
}

export function eachCalendarDate(startDate: string, endDate: string) {
  const dates: string[] = [];
  let current = startDate;

  while (compareCalendarDates(current, endDate) <= 0) {
    dates.push(current);
    current = addCalendarDays(current, 1);
  }

  return dates;
}

export function calendarDaysBetween(startDate: string, endDate: string) {
  const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
  const [endYear, endMonth, endDay] = endDate.split("-").map(Number);
  const start = Date.UTC(startYear, startMonth - 1, startDay);
  const end = Date.UTC(endYear, endMonth - 1, endDay);
  return Math.floor((end - start) / 86_400_000);
}

function formatCalendarDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

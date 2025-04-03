
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const formatDateTime = (date: Date): string => {
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const dateToTimestamp = (date: Date): number => {
  return date.getTime();
};

export const timestampToDate = (timestamp: number): Date => {
  return new Date(timestamp);
};

export const getCurrentMonday = (): Date => {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(today.setDate(diff));
};

export const getDaysDifference = (start: number, end: number): number => {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.round((end - start) / millisecondsPerDay);
};

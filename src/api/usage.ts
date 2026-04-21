export function getCurrentSessionIndex(plate: string): Promise<number> {
  console.warn('[api stub] getCurrentSessionIndex', plate);
  return Promise.resolve(0);
}

export function getCurrentSessionDate(plate: string): Promise<string | null> {
  console.warn('[api stub] getCurrentSessionDate', plate);
  return Promise.resolve(null);
}

export function getHistoricalSessionCount(
  plate: string,
  date: string,
): Promise<number> {
  console.warn('[api stub] getHistoricalSessionCount', plate, date);
  return Promise.resolve(0);
}

export function recordHistoricalSession(
  plate: string,
  date: string,
  count: number,
): Promise<void> {
  console.warn('[api stub] recordHistoricalSession', plate, date, count);
  return Promise.resolve();
}

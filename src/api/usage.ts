import { apiJson, apiVoid } from './client';

type UsageCountResponse = {
  count: number;
};

type UsageDateResponse = {
  date: string | null;
};

export async function getCurrentSessionIndex(plate: string): Promise<number> {
  const response = await apiJson<UsageCountResponse>(
    `/usage/current/${encodeURIComponent(plate)}/index`,
  );
  return response.count;
}

export async function getCurrentSessionDate(plate: string): Promise<string | null> {
  const response = await apiJson<UsageDateResponse>(
    `/usage/current/${encodeURIComponent(plate)}/date`,
  );
  return response.date;
}

export async function getHistoricalSessionCount(
  plate: string,
  date: string,
): Promise<number> {
  const response = await apiJson<UsageCountResponse>(
    `/usage/historical/${encodeURIComponent(plate)}/count?date=${encodeURIComponent(date)}`,
  );
  return response.count;
}

export async function recordHistoricalSession(
  plate: string,
  date: string,
  count: number,
): Promise<void> {
  await apiVoid('/usage/historical/record', {
    method: 'POST',
    body: { plate, date, count },
  });
}

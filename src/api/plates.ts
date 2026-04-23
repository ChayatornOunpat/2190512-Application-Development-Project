import { apiJson, apiVoid } from './client';

type PlatesResponse = {
  plates: string[];
};

export async function listPlates(): Promise<string[]> {
  const response = await apiJson<PlatesResponse>('/plates');
  return response.plates;
}

export async function replacePlates(plates: string[]): Promise<void> {
  await apiVoid('/plates', {
    method: 'PUT',
    body: { plates },
  });
}

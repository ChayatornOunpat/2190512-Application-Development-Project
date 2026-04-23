import { apiJson, apiVoid } from './client';

type PlateLockResponse = {
  holder_uid: string | null;
  ref_date: string | null;
  usage: number | null;
};

export async function getPlateLockHolderUid(plate: string): Promise<string | null> {
  const response = await apiJson<PlateLockResponse>(`/plate-locks/${encodeURIComponent(plate)}`);
  return response.holder_uid;
}

export async function claimPlateLock(
  plate: string,
  _uid: string,
  refDate: string,
  usage: number,
): Promise<void> {
  await apiVoid('/plate-locks/claim', {
    method: 'POST',
    body: {
      plate,
      ref_date: refDate,
      usage,
    },
  });
}

export async function releasePlateLock(plate: string): Promise<void> {
  await apiVoid(`/plate-locks/${encodeURIComponent(plate)}`, {
    method: 'DELETE',
  });
}

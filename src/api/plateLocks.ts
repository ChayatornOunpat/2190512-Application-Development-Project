export function getPlateLockHolderUid(plate: string): Promise<string | null> {
  console.warn('[api stub] getPlateLockHolderUid', plate);
  return Promise.resolve(null);
}

export function claimPlateLock(
  plate: string,
  uid: string,
  refDate: string,
  usage: number,
): Promise<void> {
  console.warn('[api stub] claimPlateLock', plate, uid, refDate, usage);
  return Promise.resolve();
}

export function releasePlateLock(plate: string): Promise<void> {
  console.warn('[api stub] releasePlateLock', plate);
  return Promise.resolve();
}

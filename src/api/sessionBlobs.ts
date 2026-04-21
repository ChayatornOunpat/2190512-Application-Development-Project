import type { SessionBlob } from '../types/domain';
import type { CheckpointField } from './sessions';

export type CheckpointBlob = { time: string; location?: string };

export type CheckpointSuffix = CheckpointField | 'end';

export function uploadSessionBlob(
  plate: string,
  date: string,
  count: number,
  blob: SessionBlob,
): Promise<void> {
  console.warn('[api stub] uploadSessionBlob', plate, date, count, blob);
  return Promise.resolve();
}

export function uploadCheckpointBlob(
  plate: string,
  date: string,
  count: number,
  suffix: CheckpointSuffix,
  blob: CheckpointBlob,
): Promise<void> {
  console.warn('[api stub] uploadCheckpointBlob', plate, date, count, suffix, blob);
  return Promise.resolve();
}

export function downloadSessionBlob(
  plate: string,
  date: string,
  count: number,
): Promise<SessionBlob | null> {
  console.warn('[api stub] downloadSessionBlob', plate, date, count);
  return Promise.resolve(null);
}

export function downloadCheckpointBlob(
  plate: string,
  date: string,
  count: number,
  suffix: CheckpointSuffix,
): Promise<CheckpointBlob | null> {
  console.warn('[api stub] downloadCheckpointBlob', plate, date, count, suffix);
  return Promise.resolve(null);
}

export function downloadTemplate(name: string): Promise<ArrayBuffer> {
  console.warn('[api stub] downloadTemplate', name);
  return Promise.resolve(new ArrayBuffer(0));
}

import { CHECK_FIELDS, type CheckField, type SessionBlob } from '../types/domain';
import { apiArrayBuffer, apiJson, apiVoid } from './client';
import type { CheckpointField } from './sessions';

export type CheckpointBlob = { time: string; location?: string };

export type CheckpointSuffix = CheckpointField | 'end';

type SubmissionEnvelopeResponse = {
  submission: SubmissionResponse | null;
};

type SubmissionResponse = {
  id: string;
  plate: string;
  date: string;
  count: number;
  driver_name: string;
  mile: string;
  start_location: string;
  alcohol: boolean;
  drug: boolean;
  checks: Array<{
    field: CheckField;
    passed: boolean;
    note: string;
    fix: string;
  }>;
  checkpoints: Array<{
    suffix: CheckpointSuffix;
    time: string;
    location: string | null;
  }>;
};

type CheckpointEnvelopeResponse = {
  checkpoint: CheckpointBlob | null;
};

function buildEmptySessionBlob(submission: SubmissionResponse): SessionBlob {
  const blob = {
    alcohol: submission.alcohol,
    drug: submission.drug,
    plate: submission.plate,
    mile: submission.mile,
    date: submission.date,
    name: submission.driver_name,
    startLocation: submission.start_location,
  } as SessionBlob;

  for (const field of CHECK_FIELDS) {
    blob[field] = false;
    blob[`${field}_note`] = '';
    blob[`${field}_fix`] = '';
  }

  return blob;
}

function mapSubmissionToBlob(submission: SubmissionResponse): SessionBlob {
  const blob = buildEmptySessionBlob(submission);

  for (const check of submission.checks) {
    blob[check.field] = check.passed;
    blob[`${check.field}_note`] = check.note;
    blob[`${check.field}_fix`] = check.fix;
  }

  return blob;
}

export async function uploadSessionBlob(
  plate: string,
  date: string,
  count: number,
  blob: SessionBlob,
): Promise<void> {
  await apiVoid('/submissions', {
    method: 'POST',
    body: {
      plate,
      date,
      count,
      driver_name: blob.name,
      mile: blob.mile,
      start_location: blob.startLocation,
      alcohol: blob.alcohol,
      drug: blob.drug,
      checks: CHECK_FIELDS.map((field) => ({
        field,
        passed: blob[field],
        note: blob[`${field}_note`],
        fix: blob[`${field}_fix`],
      })),
    },
  });
}

export async function uploadCheckpointBlob(
  plate: string,
  date: string,
  count: number,
  suffix: CheckpointSuffix,
  blob: CheckpointBlob,
): Promise<void> {
  await apiVoid(
    `/submissions/${encodeURIComponent(plate)}/${encodeURIComponent(date)}/${count}/checkpoints/${suffix}`,
    {
      method: 'POST',
      body: blob,
    },
  );
}

export async function downloadSessionBlob(
  plate: string,
  date: string,
  count: number,
): Promise<SessionBlob | null> {
  const response = await apiJson<SubmissionEnvelopeResponse>(
    `/submissions/${encodeURIComponent(plate)}/${encodeURIComponent(date)}/${count}`,
  );
  if (response.submission === null) {
    return null;
  }
  return mapSubmissionToBlob(response.submission);
}

export async function downloadCheckpointBlob(
  plate: string,
  date: string,
  count: number,
  suffix: CheckpointSuffix,
): Promise<CheckpointBlob | null> {
  const response = await apiJson<CheckpointEnvelopeResponse>(
    `/submissions/${encodeURIComponent(plate)}/${encodeURIComponent(date)}/${count}/checkpoints/${suffix}`,
  );
  return response.checkpoint;
}

export async function downloadTemplate(name: string): Promise<ArrayBuffer> {
  return apiArrayBuffer(`/templates/${encodeURIComponent(name)}`);
}

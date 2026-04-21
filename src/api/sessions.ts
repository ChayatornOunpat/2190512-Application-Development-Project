export type WorkingSession = {
  plate: string;
  working: boolean;
  rest1: boolean;
  rest2: boolean;
  destination: boolean;
  passRest1: boolean;
  passRest2: boolean;
  passDestination: boolean;
};

export type CheckpointField =
  | 'rest1'
  | 'rest2'
  | 'destination'
  | 'passRest1'
  | 'passRest2'
  | 'passDestination';

export type Unsubscribe = () => void;

export function watchSessionField<F extends keyof WorkingSession>(
  uid: string,
  field: F,
  onChange: (value: WorkingSession[F] | null) => void,
): Unsubscribe {
  console.warn('[api stub] watchSessionField', uid, field);
  onChange(null);
  return () => {};
}

export function startSession(uid: string, plate: string): Promise<void> {
  console.warn('[api stub] startSession', uid, plate);
  return Promise.resolve();
}

export function markCheckpointReached(
  uid: string,
  field: CheckpointField,
): Promise<void> {
  console.warn('[api stub] markCheckpointReached', uid, field);
  return Promise.resolve();
}

export function endSession(uid: string): Promise<void> {
  console.warn('[api stub] endSession', uid);
  return Promise.resolve();
}

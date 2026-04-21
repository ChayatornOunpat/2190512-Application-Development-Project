import type {
  AuthUser,
  Plate,
  PlateState,
  SessionBlob,
  SessionListing,
  WorkingField,
  WorkingRecord,
} from '../types/domain';

export type Unsubscribe = () => void;

export interface ApiClient {
  signIn(email: string, password: string): Promise<AuthUser>;
  signOut(): Promise<void>;
  getCurrentUser(): AuthUser | null;

  getPlates(): Promise<Plate[]>;

  subscribeWorking(
    uid: string,
    onChange: (record: WorkingRecord | null) => void,
  ): Unsubscribe;
  setWorkingField<F extends WorkingField>(
    uid: string,
    field: F,
    value: WorkingRecord[F],
  ): Promise<void>;
  setWorkingRecord(uid: string, record: WorkingRecord): Promise<void>;
  clearWorking(uid: string): Promise<void>;

  getPlateState(plate: Plate): Promise<PlateState | null>;
  claimPlate(plate: Plate, state: PlateState): Promise<void>;
  releasePlate(plate: Plate): Promise<void>;

  uploadSession(
    plate: Plate,
    date: string,
    count: number,
    blob: SessionBlob,
  ): Promise<void>;
  listSessions(plate: Plate, from: string, to: string): Promise<SessionListing[]>;
  downloadSessionJson(url: string): Promise<SessionBlob>;
}
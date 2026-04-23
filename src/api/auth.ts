import AsyncStorage from '@react-native-async-storage/async-storage';

import { ApiError, apiJson, apiVoid, configureApiAuth } from './client';

export type User = {
  uid: string;
  email: string | null;
  isAdmin: boolean;
};

type UserPayload = {
  uid: string;
  email: string | null;
  is_admin: boolean;
};

type SignInResponse = UserPayload & { token: string };

type CurrentUserResponse = UserPayload;

const TOKEN_STORAGE_KEY = 'appdev.jwt';

const listeners = new Set<() => void>();
const forbiddenListeners = new Set<() => void>();

let accessToken: string | null = null;

export const currentUser: { value: User | null } = { value: null };
export const authState = { ready: false };

function emitAuthChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

async function persistToken(token: string | null): Promise<void> {
  if (token === null) {
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    return;
  }
  await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
}

function mapUser(response: UserPayload): User {
  return {
    uid: response.uid,
    email: response.email,
    isAdmin: response.is_admin,
  };
}

function emitForbidden(): void {
  for (const listener of forbiddenListeners) {
    listener();
  }
}

async function clearSession(): Promise<void> {
  accessToken = null;
  currentUser.value = null;
  authState.ready = true;
  await persistToken(null);
  emitAuthChange();
}

async function applySession(token: string, user: User): Promise<User> {
  accessToken = token;
  currentUser.value = user;
  authState.ready = true;
  await persistToken(token);
  emitAuthChange();
  return user;
}

configureApiAuth({
  getAccessToken: () => accessToken,
  onUnauthorized: async () => {
    await clearSession();
  },
  onForbidden: async () => {
    emitForbidden();
  },
});

export function subscribeAuth(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function subscribeForbidden(listener: () => void): () => void {
  forbiddenListeners.add(listener);
  return () => {
    forbiddenListeners.delete(listener);
  };
}

export function getAccessToken(): string | null {
  return accessToken;
}

export async function restoreSession(): Promise<User | null> {
  authState.ready = false;
  emitAuthChange();

  const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) {
    accessToken = null;
    currentUser.value = null;
    authState.ready = true;
    emitAuthChange();
    return null;
  }

  accessToken = token;

  try {
    const response = await apiJson<CurrentUserResponse>('/auth/me');
    const user = mapUser(response);
    currentUser.value = user;
    authState.ready = true;
    emitAuthChange();
    return user;
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 401)) {
      await clearSession();
    }
    return null;
  }
}

export async function signIn(email: string, password: string): Promise<User> {
  const response = await apiJson<SignInResponse>('/auth/sign-in', {
    method: 'POST',
    body: { email, password },
    skipAuth: true,
    skipAuthReset: true,
  });
  return applySession(response.token, mapUser(response));
}

export async function signOut(): Promise<void> {
  try {
    await apiVoid('/auth/sign-out', { method: 'POST', skipAuthReset: true });
  } catch {
    // Local sign-out should still proceed if the server call fails.
  }

  await clearSession();
}

import AsyncStorage from '@react-native-async-storage/async-storage';

import { ApiError, apiJson, apiVoid, configureApiAuth } from './client';

export type User = {
  uid: string;
  email: string | null;
  isAdmin: boolean;
};

type SignInResponse = {
  token: string;
  uid: string;
  email: string | null;
};

type CurrentUserResponse = {
  uid: string;
  email: string | null;
  is_admin: boolean;
};

const TOKEN_STORAGE_KEY = 'appdev.jwt';

const listeners = new Set<() => void>();

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

function mapCurrentUser(response: CurrentUserResponse): User {
  return {
    uid: response.uid,
    email: response.email,
    isAdmin: response.is_admin,
  };
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
});

export function subscribeAuth(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
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
    const user = mapCurrentUser(response);
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

  const provisionalUser: User = {
    uid: response.uid,
    email: response.email,
    isAdmin: false,
  };

  await applySession(response.token, provisionalUser);

  try {
    const current = await apiJson<CurrentUserResponse>('/auth/me');
    const user = mapCurrentUser(current);
    currentUser.value = user;
    emitAuthChange();
    return user;
  } catch {
    return provisionalUser;
  }
}

export async function signOut(): Promise<void> {
  try {
    await apiVoid('/auth/sign-out', { method: 'POST', skipAuthReset: true });
  } catch {
    // Local sign-out should still proceed if the server call fails.
  }

  await clearSession();
}

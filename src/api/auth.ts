export type User = { uid: string; email: string | null };

export const currentUser: { value: User | null } = { value: null };

export function signIn(email: string, password: string): Promise<User> {
  console.warn('[api stub] signIn', email, password);
  return Promise.reject(new Error('[api stub] signIn not implemented'));
}

export function signOut(): Promise<void> {
  console.warn('[api stub] signOut');
  currentUser.value = null;
  return Promise.resolve();
}

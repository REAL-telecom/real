import AsyncStorage from '@react-native-async-storage/async-storage';

import { mergeDefinedFields } from '@utils';

import type { StoredUser, User } from './types';

export const USER_STORAGE_KEY = '@app/user';

export async function getUser(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as User;
}

export async function removeUser(): Promise<void> {
  await AsyncStorage.removeItem(USER_STORAGE_KEY);
}

export async function setUser(next: User): Promise<void> {
  const payload: StoredUser = next;
  await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(payload));
}

export async function updateUser(next: Partial<User>): Promise<void> {
  const currentUser = await getUser();
  if (!currentUser) return;

  const updatedUser = mergeDefinedFields(currentUser, next);
  await setUser(updatedUser);
}

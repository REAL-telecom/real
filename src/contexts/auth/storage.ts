import AsyncStorage from '@react-native-async-storage/async-storage';

import { type AuthFlowSnapshot } from './types';

const AUTH_STORAGE_KEY = '@app/auth';

export async function getAuthFlowSnapshot(): Promise<AuthFlowSnapshot | null> {
  const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  return JSON.parse(raw) as AuthFlowSnapshot;
}

export async function setAuthFlowSnapshot(snapshot: AuthFlowSnapshot): Promise<void> {
  await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(snapshot));
}

export async function removeAuthFlowSnapshot(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
}

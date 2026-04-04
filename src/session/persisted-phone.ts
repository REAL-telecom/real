import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from './storage-keys';

export async function loadPhone(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.USER_PHONE);
  } catch {
    return null;
  }
}

export async function savePhone(phone: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.USER_PHONE, phone);
}

export async function clearPhone(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.USER_PHONE);
}

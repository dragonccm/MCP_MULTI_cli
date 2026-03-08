import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'wtf_access_token';
const REFRESH_KEY = 'wtf_refresh_token';
const USER_KEY = 'wtf_user';

export async function saveToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function saveRefreshToken(token: string): Promise<void> {
  await AsyncStorage.setItem(REFRESH_KEY, token);
}

export async function getRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem(REFRESH_KEY);
}

export async function saveUser(user: Record<string, unknown>): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getUser(): Promise<Record<string, unknown> | null> {
  const data = await AsyncStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) as Record<string, unknown> : null;
}

export async function clearAuth(): Promise<void> {
  await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_KEY, USER_KEY]);
}
